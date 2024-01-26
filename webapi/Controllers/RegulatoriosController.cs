using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Route("Regulatorio")]
    [ApiController]
    public class RegulatoriosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public RegulatoriosController(KattionDataBaseContext context)
        {
            _context = context;
        }
        public class GrupoDTO
        {
            public int GrupoId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class RegulatorioDTO
        {
            public int RegulatorioId { get; set; }
            public GrupoDTO? Grupo { get; set; }
            public ClienteDropDownDTO? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public OficinaTramitanteDTO? OficinaTramitante { get; set; }
            public ResponsableDTO? Abogado { get; set; }
            public PaisDTO? Pais { get; set; } = null!;
            public string Titulo { get; set; } = null!;
            public List<RegulatorioFabricanteDTO>? Fabricantes { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public string Registro { get; set; } = null!;
            public DateTime? FechaRegistro { get; set; }
            public DateTime? FechaVencimiento { get; set; }
            public EstadosDTO Estado { get; set; } = null!;
        }

        public class RegulatorioGeneralDTO
        {
            public int RegulatorioId { get; set; }
            public string? Grupo { get; set; }
            public string? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public string? OficinaTramitante { get; set; }
            public string? Abogado { get; set; }
            public string? Pais { get; set; } = null!;
            public string Titulo { get; set; } = null!;
            public List<RegulatorioFabricanteDTO>? Fabricantes { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public string? Registro { get; set; } = null!;
            public DateTime? FechaRegistro { get; set; }
            public DateTime? FechaVencimiento { get; set; }
            public EstadosDTO Estado { get; set; } = null!;
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<RegulatorioGeneralDTO>>> SearchRegulatorios(
            int? regulatorioId,
            int? grupoId,
            int? clienteId,
            int? abogadoId,
            int? oficinaTramitanteId,
            string? pais,
            string? estadoId,
            string? titulo,
            DateTime? fechaRegistroDesde,
            DateTime? fechaRegistroHasta,
            string? referencia,
            string? registro,
            DateTime? fechaVencimientoDesde,
            DateTime? fechaVencimientoHasta
            )
        {
            if (_context.Regulatorios == null)
            {
                return NotFound();
            }

            var query = _context.Regulatorios.AsQueryable();

            if (!string.IsNullOrEmpty(regulatorioId.ToString()))
                query = query.Where(r => r.RegulatorioId.ToString().Contains(regulatorioId.ToString()));
            if (grupoId.HasValue)
                query = query.Where(r => r.GrupoId == grupoId.Value);
            if (clienteId.HasValue)
                query = query.Where(r => r.ClienteId == clienteId.Value);
            if (abogadoId.HasValue)
                query = query.Where(r => r.Abogado == abogadoId.Value);
            if (oficinaTramitanteId.HasValue)
                query = query.Where(r => r.OficinaTramitanteNavigation.ClienteId == oficinaTramitanteId.Value);
            if (oficinaTramitanteId.HasValue)
                query = query.Where(p => p.OficinaTramitante == oficinaTramitanteId.Value);
            if (!string.IsNullOrEmpty(pais))
                query = query.Where(r => r.CodigoPais == pais);
            if (!string.IsNullOrEmpty(estadoId))
                query = query.Where(r => r.Estado.Codigo == estadoId);
            if (!string.IsNullOrEmpty(titulo))
                query = query.Where(r => r.Titulo.Contains(titulo));
            if (fechaRegistroDesde.HasValue)
                query = query.Where(r => r.FechaRegistro >= fechaRegistroDesde.Value);
            if (fechaRegistroHasta.HasValue)
                query = query.Where(r => r.FechaRegistro <= fechaRegistroHasta.Value);
            if (!string.IsNullOrEmpty(referencia))
            {
                query = query.Where(p => p.ReferenciaInterna.Contains(referencia) ||
                                         p.Referencia.Any(r => r.Referencia.Contains(referencia)));
            }
            if (!string.IsNullOrEmpty(registro))
                query = query.Where(r => r.Registro.Contains(registro));
            if (fechaVencimientoDesde.HasValue)
                query = query.Where(r => r.FechaVencimiento >= fechaVencimientoDesde.Value);
            if (fechaVencimientoHasta.HasValue)
                query = query.Where(r => r.FechaVencimiento <= fechaVencimientoHasta.Value);

            // Incluye las relaciones necesarias
            query = query
                .Include(r => r.Grupo)
                .Include(r => r.Cliente)
                .Include(r => r.Contactos)
                .Include(r => r.OficinaTramitanteNavigation)
                .Include(r => r.AbogadoNavigation)
                .Include(r => r.CodigoPaisNavigation)
                .Include(r => r.RegulatorioFabricantes)
                .Include(r => r.Propietarios)
                .Include(r => r.Referencia)
                .Include(r => r.Estado);

            // Selecciona y proyecta los resultados
            var resultados = await query.Select(r => new RegulatorioGeneralDTO
            {
                RegulatorioId = r.RegulatorioId,
                Grupo = r.Grupo.Nombre,
                Cliente = r.Cliente.CodigoPaisNavigation.Nombre + ": " + r.Cliente.ClienteId + " " + r.Cliente.Nombre,
                Contactos = r.Contactos.Select(i => new ContactoDTO
                {
                    ContactoId = i.ContactoId,
                    ClienteId = i.ClienteId,
                    TipoContactoClienteId = i.TipoContactoClienteId,
                    Nombre = i.Nombre,
                    Apellido = i.Apellido,
                    Email = i.Email,
                    Telefono = i.Telefono,
                    Cargo = i.Cargo,
                    CodigoIdioma = i.CodigoIdioma
                }).ToList(),
                OficinaTramitante = r.OficinaTramitanteNavigation.Nombre,
                Abogado = r.AbogadoNavigation.Nombre + " " + r.AbogadoNavigation.Apellido,
                Pais = r.CodigoPaisNavigation.Nombre,
                Titulo = r.Titulo,
                Fabricantes = r.RegulatorioFabricantes.Select(f => new RegulatorioFabricanteDTO
                {
                    RegulatorioFabricanteId = f.RegulatorioFabricanteId,
                    RegulatorioId = f.RegulatorioId,
                    Nombre = f.Nombre
                }).ToList(),
                Solicitantes = r.Propietarios.Select(s => new SolicitantesDTO
                {
                    PropietarioId = s.PropietarioId,
                    Nombre = s.Nombre
                }).ToList(),
                ReferenciaInterna = r.ReferenciaInterna,
                Referencias = r.Referencia.Select(rr => new ReferenciaDTO
                {
                    ReferenciaId = rr.ReferenciaId,
                    TipoReferenciaId = rr.TipoReferenciaId,
                    TipoReferencia = rr.TipoReferencia.Nombre,
                    Referencia = rr.Referencia
                }).ToList(),
                Registro = r.Registro,
                FechaRegistro = r.FechaRegistro,
                FechaVencimiento = r.FechaVencimiento,
                Estado = new EstadosDTO
                {
                    Codigo = r.Estado.Codigo,
                    DescripcionEspanol = r.Estado.DescripcionEspanol,
                    DescripcionIngles = r.Estado.DescripcionIngles,
                    Color = r.Estado.Color
                }
            }).ToListAsync();

            return resultados;
        }


        // GET: api/Regulatorios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RegulatorioDTO>> GetRegulatorio(int id)
        {
            if (_context.Regulatorios == null)
            {
                return NotFound();
            }
            var regulatorio = await _context.Regulatorios
                .Where(r => r.RegulatorioId == id)
                .Include(r => r.Grupo)
                .Include(r => r.Cliente)
                .Include(r => r.Contactos)
                .Include(r => r.OficinaTramitanteNavigation)
                .Include(r => r.AbogadoNavigation)
                .Include(r => r.CodigoPaisNavigation)
                .Include(r => r.RegulatorioFabricantes)
                .Include(r => r.Propietarios)
                .Include(r => r.Referencia)
                .Include(r => r.Estado)
                .Select(r => new RegulatorioDTO
                {
                    RegulatorioId = r.RegulatorioId,
                    Grupo = new GrupoDTO
                    {
                        GrupoId = r.GrupoId,
                        Nombre = r.Grupo.Nombre
                    },
                    Cliente = new ClienteDropDownDTO
                    {
                        ClienteId = r.ClienteId,
                        Nombre = r.Cliente.Nombre
                    },
                    Contactos = r.Contactos.Select(c => new ContactoDTO
                    {
                        ContactoId = c.ContactoId,
                        ClienteId = c.ClienteId,
                        TipoContactoClienteId = c.TipoContactoClienteId,
                        Nombre = c.Nombre,
                        Apellido = c.Apellido,
                        Email = c.Email,
                        Telefono = c.Telefono,
                        Cargo = c.Cargo,
                        CodigoIdioma = c.CodigoIdioma
                    }).ToList(),
                    OficinaTramitante = new OficinaTramitanteDTO
                    {
                        ClienteId = r.OficinaTramitanteNavigation.ClienteId,
                        Nombre = r.OficinaTramitanteNavigation.Nombre,
                    },
                    Abogado = new ResponsableDTO
                    {
                        AbogadoId = r.AbogadoNavigation.AbogadoId,
                        Nombre = r.AbogadoNavigation.Nombre,
                        Apellido = r.AbogadoNavigation.Apellido
                    },
                    Pais = new PaisDTO
                    {
                        CodigoPais = r.CodigoPaisNavigation.CodigoPais,
                        Nombre = r.CodigoPaisNavigation.Nombre
                    },
                    Titulo = r.Titulo,
                    Fabricantes = r.RegulatorioFabricantes.Select(f => new RegulatorioFabricanteDTO
                    {
                        RegulatorioFabricanteId = f.RegulatorioFabricanteId,
                        Nombre = f.Nombre,
                        CodigoPais = f.CodigoPaisNavigation.CodigoPais,
                        Ciudad = f.Ciudad

                    }).ToList(),
                    Solicitantes = r.Propietarios.Select(s => new SolicitantesDTO
                    {
                        PropietarioId = s.PropietarioId,
                        Nombre = s.Nombre
                    }).ToList(),
                    ReferenciaInterna = r.ReferenciaInterna,
                    Referencias = r.Referencia.Select(rr => new ReferenciaDTO
                    {
                        ReferenciaId = rr.ReferenciaId,
                        TipoReferenciaId = rr.TipoReferenciaId,
                        TipoReferencia = rr.TipoReferencia.Nombre,
                        Referencia = rr.Referencia
                    }).ToList(),
                    Estado = new EstadosDTO
                    {
                        Codigo = r.Estado.Codigo,
                        DescripcionEspanol = r.Estado.DescripcionEspanol,
                        DescripcionIngles = r.Estado.DescripcionIngles,
                        Color = r.Estado.Color
                    },
                    Registro = r.Registro,
                    FechaRegistro = r.FechaRegistro,
                    FechaVencimiento = r.FechaVencimiento
                })
                .FirstOrDefaultAsync();

            if (regulatorio == null)
            {
                return NotFound();
            }

            return regulatorio;
        }

        public class RegulatorioInputDTO
        {
            public int RegulatorioId { get; set; }
            public int GrupoId { get; set; }
            public int ClienteId { get; set; }
            public List<int>? ContactosIds { get; set; }
            public int OficinaTramitanteId { get; set; }
            public int Abogado { get; set; }
            public string CodigoPais { get; set; } = null!;
            public string Titulo { get; set; } = null!;
            public List<int>? SolicitantesIds { get; set; } = new List<int>();
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public string Registro { get; set; } = null!;
            public DateTime? FechaRegistro { get; set; }
            public DateTime? FechaVencimiento { get; set; }
            public string EstadoId { get; set; } = null!;
            public List<RegulatorioFabricanteDTO> Fabricantes { get; set; } = new List<RegulatorioFabricanteDTO>();
        }

        [HttpPost]
        public async Task<ActionResult<Regulatorio>> PostPatente(RegulatorioInputDTO regulatorioDto)
        {
            if (_context.Regulatorios == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Regulatorios' is null.");
            }

            var regulatorio = new Regulatorio
            {
                GrupoId = regulatorioDto.GrupoId,
                ClienteId = regulatorioDto.ClienteId,
                OficinaTramitante = regulatorioDto.OficinaTramitanteId,
                Abogado = regulatorioDto.Abogado,
                CodigoPais = regulatorioDto.CodigoPais,
                Titulo = regulatorioDto.Titulo,
                ReferenciaInterna = regulatorioDto.ReferenciaInterna,
                Registro = regulatorioDto.Registro,
                FechaRegistro = regulatorioDto.FechaRegistro,
                FechaVencimiento = regulatorioDto.FechaVencimiento,
                EstadoId = regulatorioDto.EstadoId
            };

            // Contactos
            foreach (var contactoId in regulatorioDto.ContactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    regulatorio.Contactos.Add(contacto); // Asume una relación de muchos a muchos
                }
            }

            // Solicitantes
            foreach (var solicitanteId in regulatorioDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    regulatorio.Propietarios.Add(solicitante); // Asume una relación de muchos a muchos
                }
            }

            // Referencias
            foreach (var referenciaDto in regulatorioDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                regulatorio.Referencia.Add(referencia);
            }

            foreach (var fabricanteDto in regulatorioDto.Fabricantes)
            {
                var fabricante = new RegulatorioFabricante
                {
                    Nombre = fabricanteDto.Nombre,
                    CodigoPais = fabricanteDto.CodigoPais,
                    Ciudad = fabricanteDto.Ciudad
                };
                regulatorio.RegulatorioFabricantes.Add(fabricante);
            }

            _context.Regulatorios.Add(regulatorio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRegulatorio", new { id = regulatorio.RegulatorioId }, regulatorio);
        }


        // PUT: api/Regulatorios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRegulatorio(int id, RegulatorioInputDTO regulatorioDto)
        {
            var regulatorio = await _context.Regulatorios
                .Include(r => r.Contactos)
                .Include(r => r.Propietarios)
                .Include(r => r.Referencia)
                .Include(r => r.RegulatorioFabricantes)
                .FirstOrDefaultAsync(r => r.RegulatorioId == id);

            if (regulatorio == null)
            {
                return NotFound();
            }

            // Actualizar propiedades simples
            regulatorio.GrupoId = regulatorioDto.GrupoId;
            regulatorio.ClienteId = regulatorioDto.ClienteId;
            regulatorio.OficinaTramitante = regulatorioDto.OficinaTramitanteId;
            regulatorio.Abogado = regulatorioDto.Abogado;
            regulatorio.CodigoPais = regulatorioDto.CodigoPais;
            regulatorio.Titulo = regulatorioDto.Titulo;
            regulatorio.ReferenciaInterna = regulatorioDto.ReferenciaInterna;
            regulatorio.Registro = regulatorioDto.Registro;
            regulatorio.FechaRegistro = regulatorioDto.FechaRegistro;
            regulatorio.FechaVencimiento = regulatorioDto.FechaVencimiento;
            regulatorio.EstadoId = regulatorioDto.EstadoId;

            // Contactos
            regulatorio.Contactos.Clear();
            foreach (var contactoId in regulatorioDto.ContactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    regulatorio.Contactos.Add(contacto);
                }
            }

            // Solicitantes
            regulatorio.Propietarios.Clear();
            foreach (var solicitanteId in regulatorioDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    regulatorio.Propietarios.Add(solicitante);
                }
            }

            // Referencias
            regulatorio.Referencia.Clear();
            foreach (var referenciaDto in regulatorioDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                regulatorio.Referencia.Add(referencia);
            }

            // Fabricantes
            regulatorio.RegulatorioFabricantes.Clear();
            foreach (var fabricanteDto in regulatorioDto.Fabricantes)
            {
                var fabricante = new RegulatorioFabricante
                {
                    Nombre = fabricanteDto.Nombre,
                    CodigoPais = fabricanteDto.CodigoPais,
                    Ciudad = fabricanteDto.Ciudad
                };
                regulatorio.RegulatorioFabricantes.Add(fabricante);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegulatorioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegulatorio(int id)
        {
            var regulatorio = await _context.Regulatorios
                .Include(r => r.Contactos)
                .Include(r => r.Propietarios)
                .Include(r => r.Referencia)
                .Include(r => r.RegulatorioFabricantes)
                .FirstOrDefaultAsync(r => r.RegulatorioId == id);

            if (regulatorio == null)
            {
                return NotFound();
            }

            regulatorio.Contactos.Clear();
            regulatorio.Propietarios.Clear();
            regulatorio.Referencia.Clear();
            regulatorio.RegulatorioFabricantes.Clear();


            _context.Regulatorios.Remove(regulatorio);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool RegulatorioExists(int id)
        {
            return (_context.Regulatorios?.Any(e => e.RegulatorioId == id)).GetValueOrDefault();
        }
    }
}
