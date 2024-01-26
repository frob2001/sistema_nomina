using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using Azure.Storage.Blobs;

namespace webapi.Controllers
{
    [Route("Marcas")]
    [ApiController]
    public class MarcasController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;
        public MarcasController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context; 
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public class TipoSistemaMarcaDTO
        {
            public int TipoSistemaMarcaId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class TipoSignoMarcaDTO
        {
            public int TipoSignoMarcaId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class TipoMarcaDTO
        {
            public int TipoMarcaId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class MarcaClaseDTO
        {
            public int CodigoClase { get; set; }
            public string CoberturaEspanol { get; set; }
            public string CoberturaIngles { get; set; }
        }


        public class PrioridadMarcaDTO
        {
            public int PrioridadMarcaId { get; set; }
            public string CodigoPais { get; set; } = null!;
            public string Numero { get; set; } = null!;
            public DateTime Fecha { get; set; }
        }


        public class PublicacionMarcaDTO
        {
            public int PublicacionMarcaId { get; set; }
            public int TipoPublicacionId { get; set; }
            public int NumeroGaceta { get; set; }
            public string Pagina { get; set; } = null!;
        }

        public class MarcaDTO
        {
            public int MarcaId { get; set; }
            public TipoSistemaMarcaDTO? TipoSistemaMarca { get; set; }
            public ClienteDropDownDTO? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public OficinaTramitanteDTO? OficinaTramitante { get; set; }
            public ResponsableDTO? Abogado { get; set; }
            public string? AbogadoInternacional { get; set; }
            public List<PaisDTO> Paises { get; set; }
            public string Signo { get; set; } = null!;
            public TipoSignoMarcaDTO? TipoSignoMarca { get; set; }
            public TipoMarcaDTO? TipoMarca { get; set; }
            public List<MarcaClaseDTO> Clases { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public DateTime? PrimerUso { get; set; }
            public DateTime? PruebaUso { get; set; }
            public string? Caja { get; set; }
            public bool? Comparacion { get; set; }
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Certificado { get; set; }
            public DateTime? FechaCertificado { get; set; }
            public DateTime? Vencimiento { get; set; }
            public List<PrioridadMarcaDTO>? PrioridadMarca { get; set; }
            public List<PublicacionMarcaDTO>? Publicaciones { get; set; }
            public bool TieneFigura { get; set; }
        }

        public class MarcaGeneralDTO
        {
            public int MarcaId { get; set; }
            public string? TipoSistemaMarca { get; set; }
            public string? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public string? OficinaTramitante { get; set; }
            public string? Abogado { get; set; }
            public List<PaisDTO> Paises { get; set; }
            public string Signo { get; set; } = null!;
            public string? TipoSignoMarca { get; set; }
            public string? TipoMarca { get; set; }
            public List<MarcaClaseDTO> Clases { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public DateTime? PrimerUso { get; set; }
            public DateTime? PruebaUso { get; set; }
            public string? Caja { get; set; }
            public bool? Comparacion { get; set; }
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Certificado { get; set; }
            public DateTime? FechaCertificado { get; set; }
            public DateTime? Vencimiento { get; set; }
            public bool TieneFigura { get; set; }
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<MarcaGeneralDTO>>> SearchMarcas(
      string? DropdownSearch,
      int? marcaId,
      int? tipoSistemaMarcaId,
      int? clienteId,
      int? oficinaTramitanteId,
      int? abogadoId,
      string? abogadoInternacional,
      string? contacto,
      string? signo,
      string? codigoPais,
      string? estadoId,
      int? claseId,
      int? tipoSignoMarcaId,
      int? tipoMarcaId,
      int? numeroGaceta,
      int? tipoPublicacionId,
      string? numeroPrioridad,
      string? referencia,
      string? registro,
      string? certificado,
      string? solicitud,
      DateTime? fechaRegistroDesde,
      DateTime? fechaRegistroHasta,
      DateTime? fechaSolicitudDesde,
      DateTime? fechaSolicitudHasta,
      DateTime? fechaCertificadoDesde,
      DateTime? fechaCertificadoHasta,
      DateTime? fechaPrioridadDesde,
      DateTime? fechaPrioridadHasta,
      DateTime? fechaPublicacionDesde,
      DateTime? fechaPublicacionHasta,
      DateTime? vencimientoDesde,
      DateTime? vencimientoHasta,
      bool cantidad)
        {
            if (_context.Marcas == null)
            {
                return NotFound();
            }

            var query = _context.Marcas.AsQueryable();

            cantidad = false;
            if (!string.IsNullOrWhiteSpace(DropdownSearch))
            {
                query = query.Where(m => m.Signo.Contains(DropdownSearch) || m.MarcaId.ToString().Contains(DropdownSearch));
                cantidad = true;
            }

            if (!string.IsNullOrEmpty(marcaId.ToString()))
            {
                query = query.Where(m => m.MarcaId.ToString().Contains(marcaId.ToString()));
            }
            if (tipoSistemaMarcaId.HasValue)
            {
                query = query.Where(m => m.TipoSistemaMarcaId == tipoSistemaMarcaId.Value);
            }
            if (clienteId.HasValue)
            {
                query = query.Where(m => m.ClienteId == clienteId.Value);
            }
            if (oficinaTramitanteId.HasValue)
            {
                query = query.Where(m => m.OficinaTramitante == oficinaTramitanteId.Value);
            }
            if (abogadoId.HasValue)
            {
                query = query.Where(m => m.Abogado == abogadoId.Value);
            }
            if (!string.IsNullOrEmpty(abogadoInternacional))
            {
                query = query.Where(m => m.AbogadoInternacional.Contains(abogadoInternacional));
            }
            if (!string.IsNullOrEmpty(codigoPais))
            {
                query = query.Where(m => m.CodigoPais.Any(p => p.CodigoPais == codigoPais));
            }
            if (!string.IsNullOrEmpty(estadoId))
            {
                query = query.Where(m => m.EstadoMarcas.Any(e => e.Estado.Codigo == estadoId));
            }
            if (claseId.HasValue)
            {
                query = query.Where(m => m.MarcaClases.Any(c => c.CodigoClase == claseId.Value));
            }
            if (!string.IsNullOrEmpty(contacto))
            {
                query = query.Where(m => m.Contactos.Any(c => c.Nombre.Contains(contacto) || c.Apellido.Contains(contacto)));
            }
            if (!string.IsNullOrEmpty(signo))
            {
                query = query.Where(m => m.Signo.Contains(signo));
            }
            if (tipoSignoMarcaId.HasValue)
            {
                query = query.Where(m => m.TipoSignoMarcaId == tipoSignoMarcaId.Value);
            }
            if (tipoMarcaId.HasValue)
            {
                query = query.Where(m => m.TipoMarcaId == tipoMarcaId.Value);
            }
            if (!string.IsNullOrEmpty(referencia))
            {
                query = query.Where(p => p.ReferenciaInterna.Contains(referencia) ||
                                         p.Referencia.Any(r => r.Referencia.Contains(referencia)));
            }
            if (!string.IsNullOrEmpty(registro))
            {
                query = query.Where(m => m.Registro.Contains(registro));
            }
            if (!string.IsNullOrEmpty(certificado))
            {
                query = query.Where(m => m.Certificado.Contains(certificado));
            }
            if (!string.IsNullOrEmpty(solicitud))
            {
                query = query.Where(m => m.Solicitud.Contains(solicitud));
            }
            if (fechaRegistroDesde.HasValue)
            {
                query = query.Where(m => m.FechaRegistro >= fechaRegistroDesde.Value);
            }
            if (fechaRegistroHasta.HasValue)
            {
                query = query.Where(m => m.FechaRegistro <= fechaRegistroHasta.Value);
            }
            if (fechaSolicitudDesde.HasValue)
            {
                query = query.Where(m => m.FechaSolicitud >= fechaSolicitudDesde.Value);
            }
            if (fechaSolicitudHasta.HasValue)
            {
                query = query.Where(m => m.FechaSolicitud <= fechaSolicitudHasta.Value);
            }
            if (fechaCertificadoDesde.HasValue)
            {
                query = query.Where(m => m.FechaCertificado >= fechaCertificadoDesde.Value);
            }
            if (fechaCertificadoHasta.HasValue)
            {
                query = query.Where(m => m.FechaCertificado <= fechaCertificadoHasta.Value);
            }

            if (!string.IsNullOrEmpty(numeroPrioridad))
            {
                query = query.Where(m => m.PrioridadMarcas.Any(c => c.Numero.Contains(numeroPrioridad)));
            }
            if (fechaPrioridadDesde.HasValue)
            {
                query = query.Where(m => m.PrioridadMarcas.Any(p => p.Fecha >= fechaPrioridadDesde.Value));
            }
            if (fechaPrioridadHasta.HasValue)
            {
                query = query.Where(m => m.PrioridadMarcas.Any(p => p.Fecha <= fechaPrioridadHasta.Value));
            }
            if (numeroGaceta.HasValue)
            {
                query = query.Where(m => m.PublicacionMarcas.Any(p => p.NumeroGacetaNavigation.Numero == numeroGaceta));
            }
            if (fechaPublicacionDesde.HasValue)
            {
                query = query.Where(m => m.PublicacionMarcas.Any(p => p.NumeroGacetaNavigation.Fecha >= fechaPublicacionDesde.Value));
            }
            if (fechaPublicacionHasta.HasValue)
            {
                query = query.Where(m => m.PublicacionMarcas.Any(p => p.NumeroGacetaNavigation.Fecha <= fechaPublicacionHasta.Value));
            }

            if (tipoPublicacionId.HasValue)
            {
                query = query.Where(m => m.PublicacionMarcas.Any(p => p.TipoPublicacionId == tipoPublicacionId));
            }


            if (vencimientoDesde.HasValue)
            {
                query = query.Where(m => m.Vencimiento >= vencimientoDesde.Value);
            }
            if (vencimientoHasta.HasValue)
            {
                query = query.Where(m => m.Vencimiento <= vencimientoHasta.Value);
            }

            query = query
                .Include(m => m.TipoSistemaMarca)
                .Include(m => m.Cliente)
                .Include(m => m.Contactos)
                .Include(m => m.OficinaTramitanteNavigation)
                .Include(m => m.AbogadoNavigation)
                .Include(m => m.CodigoPais)
                .Include(m => m.TipoSignoMarca)
                .Include(m => m.TipoMarca)
                .Include(m => m.MarcaClases)
                .Include(m => m.Propietarios)
                .Include(m => m.Referencia);

            var marcas = new List<MarcaGeneralDTO>();
            if (cantidad)
            {
                marcas = await query
                .Select(m => new MarcaGeneralDTO
                {
                    MarcaId = m.MarcaId,
                    TipoSistemaMarca = m.TipoSistemaMarca.Nombre,
                    Cliente = m.Cliente.CodigoPaisNavigation.Nombre + ": " + m.Cliente.ClienteId + " " + m.Cliente.Nombre,
                    Contactos = m.Contactos.Select(i => new ContactoDTO
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
                    OficinaTramitante = m.OficinaTramitanteNavigation.Nombre,
                    Abogado = m.AbogadoNavigation.Nombre + " " + m.AbogadoNavigation.Apellido,
                    Paises = m.CodigoPais.Select(p => new PaisDTO
                    {
                        CodigoPais = p.CodigoPais,
                        Nombre = p.Nombre
                    }).ToList(),
                    TipoSignoMarca = m.TipoSignoMarca.Nombre,
                    Signo = m.Signo,
                    TipoMarca = m.TipoMarca.Nombre,
                    Clases = m.MarcaClases.Select(c => new MarcaClaseDTO
                    {
                        CodigoClase = c.CodigoClaseNavigation.Codigo,
                        CoberturaEspanol = c.CoberturaEspanol,
                        CoberturaIngles = c.CoberturaIngles
                    }).ToList(),
                    Solicitantes = m.Propietarios.Select(i => new SolicitantesDTO
                    {
                        PropietarioId = i.PropietarioId,
                        Nombre = i.Nombre
                    }).ToList(),
                    ReferenciaInterna = m.ReferenciaInterna,
                    Referencias = m.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    Estados = m.EstadoMarcas.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    PrimerUso = m.PrimerUso,
                    PruebaUso = m.PruebaUso,
                    Caja = m.Caja,
                    Comparacion = m.Comparacion,
                    Solicitud = m.Solicitud,
                    FechaSolicitud = m.FechaSolicitud,
                    Registro = m.Registro,
                    FechaRegistro = m.FechaRegistro,
                    Certificado = m.Certificado,
                    FechaCertificado = m.FechaCertificado,
                    Vencimiento = m.Vencimiento,
                    TieneFigura = m.TieneFigura
                })
                .Take(50)
                .ToListAsync();
            }
            else
            {
                marcas = await query
                .Select(m => new MarcaGeneralDTO
                {
                    MarcaId = m.MarcaId,
                    TipoSistemaMarca = m.TipoSistemaMarca.Nombre,
                    Cliente = m.Cliente.CodigoPaisNavigation.Nombre + ": " + m.Cliente.ClienteId + " " + m.Cliente.Nombre,
                    Contactos = m.Contactos.Select(i => new ContactoDTO
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
                    OficinaTramitante = m.OficinaTramitanteNavigation.Nombre,
                    Abogado = m.AbogadoNavigation.Nombre + " " + m.AbogadoNavigation.Apellido,
                    Paises = m.CodigoPais.Select(p => new PaisDTO
                    {
                        CodigoPais = p.CodigoPais,
                        Nombre = p.Nombre
                    }).ToList(),
                    TipoSignoMarca = m.TipoSignoMarca.Nombre,
                    Signo = m.Signo,
                    TipoMarca = m.TipoMarca.Nombre,
                    Clases = m.MarcaClases.Select(c => new MarcaClaseDTO
                    {
                        CodigoClase = c.CodigoClaseNavigation.Codigo,
                        CoberturaEspanol = c.CoberturaEspanol,
                        CoberturaIngles = c.CoberturaIngles
                    }).ToList(),
                    Solicitantes = m.Propietarios.Select(i => new SolicitantesDTO
                    {
                        PropietarioId = i.PropietarioId,
                        Nombre = i.Nombre
                    }).ToList(),
                    ReferenciaInterna = m.ReferenciaInterna,
                    Referencias = m.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    Estados = m.EstadoMarcas.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    PrimerUso = m.PrimerUso,
                    PruebaUso = m.PruebaUso,
                    Caja = m.Caja,
                    Comparacion = m.Comparacion,
                    Solicitud = m.Solicitud,
                    FechaSolicitud = m.FechaSolicitud,
                    Registro = m.Registro,
                    FechaRegistro = m.FechaRegistro,
                    Certificado = m.Certificado,
                    FechaCertificado = m.FechaCertificado,
                    Vencimiento = m.Vencimiento,
                    TieneFigura = m.TieneFigura
                })
                .ToListAsync();
            }

            return marcas;
        }



        // GET: api/Marcas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MarcaDTO>> GetMarca(int id)
        {
            if (_context.Marcas == null)
            {
                return NotFound();
            }

            var marca = await _context.Marcas
                .Where(m => m.MarcaId == id)
                .Include(m => m.TipoSistemaMarca)
                .Include(m => m.Cliente)
                .Include(m => m.Contactos)
                .Include(m => m.OficinaTramitanteNavigation)
                .Include(m => m.AbogadoNavigation)
                .Include(m => m.CodigoPais)
                .Include(m => m.MarcaClases)
                    .ThenInclude(mc => mc.CodigoClaseNavigation)
                .Include(m => m.Propietarios)
                .Include(m => m.Referencia)
                .Include(m => m.EstadoMarcas)
                    .ThenInclude(em => em.Estado)
                .Select(m => new MarcaDTO
                {
                    MarcaId = m.MarcaId,
                    TipoSistemaMarca = new TipoSistemaMarcaDTO
                    {
                        TipoSistemaMarcaId = m.TipoSistemaMarca.TipoSistemaMarcaId,
                        Nombre = m.TipoSistemaMarca.Nombre
                    },
                    Cliente = new ClienteDropDownDTO
                    {
                        ClienteId = m.ClienteId,
                        Nombre = m.Cliente.Nombre,
                    },
                    Contactos = m.Contactos.Select(i => new ContactoDTO
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
                    OficinaTramitante = new OficinaTramitanteDTO
                    {
                        ClienteId = m.OficinaTramitanteNavigation.ClienteId,
                        Nombre = m.OficinaTramitanteNavigation.Nombre,
                    },
                    Abogado = new ResponsableDTO
                    {
                        AbogadoId = m.AbogadoNavigation.AbogadoId,
                        Nombre = m.AbogadoNavigation.Nombre,
                        Apellido = m.AbogadoNavigation.Apellido
                    },
                    AbogadoInternacional = m.AbogadoInternacional,
                    Paises = m.CodigoPais.Select(p => new PaisDTO
                    {
                        CodigoPais = p.CodigoPais,
                        Nombre = p.Nombre
                    }).ToList(),
                    Signo = m.Signo,
                    TipoSignoMarca = new TipoSignoMarcaDTO
                    {
                        TipoSignoMarcaId = m.TipoSignoMarca.TipoSignoMarcaId,
                        Nombre = m.TipoSignoMarca.Nombre,
                    },
                    Clases = m.MarcaClases.Select(mc => new MarcaClaseDTO
                    {
                        CodigoClase = mc.CodigoClase,
                        CoberturaEspanol = mc.CoberturaEspanol,
                        CoberturaIngles = mc.CoberturaIngles
                    }).ToList(),
                    Solicitantes = m.Propietarios.Select(i => new SolicitantesDTO
                    {
                        PropietarioId = i.PropietarioId,
                        Nombre = i.Nombre
                    }).ToList(),
                    TipoMarca = new TipoMarcaDTO
                    {
                        TipoMarcaId = m.TipoMarca.TipoMarcaId,
                        Nombre = m.TipoMarca.Nombre,
                    },
                    ReferenciaInterna = m.ReferenciaInterna,
                    Referencias = m.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferencia.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    PrimerUso = m.PrimerUso,
                    PruebaUso = m.PruebaUso,
                    Caja = m.Caja,
                    Comparacion = m.Comparacion,
                    PrioridadMarca = m.PrioridadMarcas.Select(mpr => new PrioridadMarcaDTO
                    {
                        PrioridadMarcaId = mpr.PrioridadMarcaId,
                        CodigoPais = mpr.CodigoPais,
                        Numero = mpr.Numero,
                        Fecha = mpr.Fecha
                    }).ToList(),
                    Estados = m.EstadoMarcas.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    Solicitud = m.Solicitud,
                    FechaSolicitud = m.FechaSolicitud,
                    Registro = m.Registro,
                    FechaRegistro = m.FechaRegistro,
                    Certificado = m.Certificado,
                    FechaCertificado = m.FechaCertificado,
                    Vencimiento = m.Vencimiento,
                    TieneFigura = m.TieneFigura,
                    Publicaciones = m.PublicacionMarcas.Select(mup => new PublicacionMarcaDTO
                    {
                        PublicacionMarcaId = mup.PublicacionMarcaId,
                        TipoPublicacionId = mup.TipoPublicacionId,
                        NumeroGaceta = mup.NumeroGaceta,
                        Pagina = mup.Pagina
                    }).ToList()

                })
                .FirstOrDefaultAsync();

            if (marca == null)
            {
                return NotFound();
            }

            return marca;
        }

        public class MarcaComparacionDto
        {
            public bool Comparacion { get; set; }
        }


        [HttpPatch("{id}/Comparacion")]
        public async Task<IActionResult> PatchMarca(int id, [FromBody] MarcaComparacionDto marcaUpdateDto)
        {
            var marca = await _context.Marcas.FindAsync(id);
            if (marca == null)
            {
                return NotFound("Marca not found");
            }

            // Update the Comparacion field
            marca.Comparacion = marcaUpdateDto.Comparacion;

            _context.Marcas.Update(marca);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MarcaExists(id))
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

        public class MarcaInputDTO
        {
            public int TipoSistemaMarcaId { get; set; }
            public int ClienteId { get; set; }
            public List<int>? contactosIds { get; set; }
            public int OficinaTramitanteId { get; set; }
            public int AbogadoId { get; set; }
            public string? AbogadoInternacional { get; set; }
            public List<string>? Paises { get; set; }
            public string Signo { get; set; } = null!;
            public int TipoSignoMarcaId { get; set; }
            public int TipoMarcaId { get; set; }
            public List<MarcaClaseDTO> Clases { get; set; } = new List<MarcaClaseDTO>();
            public List<int>? SolicitantesIds { get; set; } = new List<int>();
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO> Referencias { get; set; } = new List<ReferenciaDTO>();
            public List<string>? Estados { get; set; }
            public DateTime? PrimerUso { get; set; }
            public DateTime? PruebaUso { get; set; }
            public string? Caja { get; set; }
            public bool? Comparacion { get; set; }
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Certificado { get; set; }
            public DateTime? FechaCertificado { get; set; }
            public DateTime? Vencimiento { get; set; }
            public bool TieneFigura { get; set; }
            public List<PrioridadMarcaDTO>? PrioridadMarca { get; set; } = new List<PrioridadMarcaDTO>();
            public List<PublicacionMarcaDTO>? Publicaciones { get; set; } = new List<PublicacionMarcaDTO>();
        }

        [HttpPost]
        public async Task<ActionResult<Marca>> PostMarca(MarcaInputDTO marcaDto)
        {
            if (_context.Marcas == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Marcas' is null.");
            }

            var marca = new Marca
            {
                TipoSistemaMarcaId = marcaDto.TipoSistemaMarcaId,
                ClienteId = marcaDto.ClienteId,
                OficinaTramitante = marcaDto.OficinaTramitanteId,
                Abogado = marcaDto.AbogadoId,
                AbogadoInternacional = marcaDto.AbogadoInternacional,
                Signo = marcaDto.Signo,
                TipoSignoMarcaId = marcaDto.TipoSignoMarcaId,
                TipoMarcaId = marcaDto.TipoMarcaId,
                ReferenciaInterna = marcaDto.ReferenciaInterna,
                PrimerUso = marcaDto.PrimerUso,
                PruebaUso = marcaDto.PruebaUso,
                Caja = marcaDto.Caja,
                Comparacion = marcaDto.Comparacion,
                Solicitud = marcaDto.Solicitud,
                FechaSolicitud = marcaDto.FechaSolicitud,
                Registro = marcaDto.Registro,
                FechaRegistro = marcaDto.FechaRegistro,
                Certificado = marcaDto.Certificado,
                FechaCertificado = marcaDto.FechaCertificado,
                Vencimiento = marcaDto.Vencimiento,
                TieneFigura = marcaDto.TieneFigura
            };

            foreach (var contactoId in marcaDto.contactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    marca.Contactos.Add(contacto);
                }
            }

            foreach (var codigoPais in marcaDto.Paises)
            {
                var pais = await _context.Pais.FindAsync(codigoPais);
                if (pais != null)
                {
                    marca.CodigoPais.Add(pais);
                }
            }

            foreach (var claseDto in marcaDto.Clases)
            {
                var clase = new MarcaClase
                {
                    CodigoClase = claseDto.CodigoClase,
                    CoberturaEspanol = claseDto.CoberturaEspanol,
                    CoberturaIngles = claseDto.CoberturaIngles
                };

                marca.MarcaClases.Add(clase);
            }

            foreach (var solicitanteId in marcaDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    marca.Propietarios.Add(solicitante); // Asume una relación de muchos a muchos
                }
            }

            foreach (var referenciaDto in marcaDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                marca.Referencia.Add(referencia);
            }

            if (marcaDto.Estados != null)
            {
                foreach (var estadoId in marcaDto.Estados)
                {
                    var estado = await _context.Estados.FindAsync(estadoId);
                    if (estado != null)
                    {
                        marca.EstadoMarcas.Add(new EstadoMarca { EstadoId = estadoId });
                    }
                }
            }

            // Prioridades de marca
            foreach (var prioridadDto in marcaDto.PrioridadMarca)
            {
                var prioridad = new PrioridadMarca
                {
                    CodigoPais = prioridadDto.CodigoPais,
                    Numero = prioridadDto.Numero,
                    Fecha = prioridadDto.Fecha,
                };
                marca.PrioridadMarcas.Add(prioridad);
            }

            // Prioridades de marca
            foreach (var publicacionMarcaDTO in marcaDto.Publicaciones)
            {
                var publicacion = new PublicacionMarca
                {
                    TipoPublicacionId = publicacionMarcaDTO.TipoPublicacionId,
                    NumeroGaceta = publicacionMarcaDTO.NumeroGaceta,
                    Pagina = publicacionMarcaDTO.Pagina
                };
                marca.PublicacionMarcas.Add(publicacion);
            }
            _context.Marcas.Add(marca);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMarca", new { id = marca.MarcaId }, marca);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMarca(int id, MarcaInputDTO marcaDto)
        {
            var marca = await _context.Marcas
                .Include(p => p.Contactos)
                .Include(p => p.Propietarios)
                .Include(p => p.EstadoMarcas)
                .Include(p => p.CodigoPais)
                .Include(p => p.Referencia)
                .Include(p => p.PrioridadMarcas)
                .Include(p => p.PublicacionMarcas)
                .Include(p => p.MarcaClases)
                .FirstOrDefaultAsync(p => p.MarcaId == id);


            if (marca == null)
            {
                return NotFound();
            }

            // Actualizar campos básicos de la marca
            marca.TipoSistemaMarcaId = marcaDto.TipoSistemaMarcaId;
            marca.ClienteId = marcaDto.ClienteId;
            marca.OficinaTramitante = marcaDto.OficinaTramitanteId;
            marca.Abogado = marcaDto.AbogadoId;
            marca.AbogadoInternacional = marcaDto.AbogadoInternacional;
            marca.Signo = marcaDto.Signo;
            marca.TipoSignoMarcaId = marcaDto.TipoSignoMarcaId;
            marca.TipoSistemaMarcaId = marcaDto.TipoSistemaMarcaId;
            marca.TipoMarcaId = marcaDto.TipoMarcaId;
            marca.ReferenciaInterna = marcaDto.ReferenciaInterna;
            marca.PrimerUso = marcaDto.PrimerUso;
            marca.PruebaUso = marcaDto.PruebaUso;
            marca.Caja = marcaDto.Caja;
            marca.Comparacion = marcaDto.Comparacion;
            marca.Solicitud = marcaDto.Solicitud;
            marca.FechaSolicitud = marcaDto.FechaSolicitud;
            marca.Registro = marcaDto.Registro;
            marca.FechaRegistro = marcaDto.FechaRegistro;
            marca.Certificado = marcaDto.Certificado;
            marca.FechaCertificado = marcaDto.FechaCertificado;
            marca.Vencimiento = marcaDto.Vencimiento;
            marca.TieneFigura = marcaDto.TieneFigura;

            // Actualizar relaciones como Contactos, Inventores, etc.
            marca.Contactos.Clear();
            foreach (var contactoId in marcaDto.contactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    marca.Contactos.Add(contacto);
                }
            }

            // Eliminar todas las relaciones de país existentes
            marca.CodigoPais.Clear();

            // Agregar nuevas relaciones de país
            foreach (var codigoPais in marcaDto.Paises)
            {
                var pais = await _context.Pais.FirstOrDefaultAsync(p => p.CodigoPais == codigoPais);
                if (pais != null)
                {
                    marca.CodigoPais.Add(pais);
                }
            }

            foreach (var claseActual in marca.MarcaClases.ToList())
            {
                _context.MarcaClases.Remove(claseActual);
            }
            marca.MarcaClases.Clear();

            // Agregar nuevas relaciones de clases
            foreach (var claseDto in marcaDto.Clases)
            {
                var clase = new MarcaClase
                {
                    CodigoClase = claseDto.CodigoClase,
                    CoberturaEspanol = claseDto.CoberturaEspanol,
                    CoberturaIngles = claseDto.CoberturaIngles
                };
                marca.MarcaClases.Add(clase);
            }


            marca.Propietarios.Clear();
            foreach (var solicitanteId in marcaDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    marca.Propietarios.Add(solicitante);
                }
            }

            foreach (var referenciaActual in marca.Referencia.ToList())
            {
                _context.Referencia.Remove(referenciaActual);
            }
            marca.Referencia.Clear();
            foreach (var referenciaDto in marcaDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                marca.Referencia.Add(referencia);
            }

            marca.EstadoMarcas.Clear();
            foreach (var estadoCodigo in marcaDto.Estados)
            {
                var estado = await _context.Estados.FirstOrDefaultAsync(e => e.Codigo == estadoCodigo);
                if (estado != null)
                {
                    marca.EstadoMarcas.Add(new EstadoMarca { Estado = estado });
                }
            }

            foreach (var prioridadActual in marca.PrioridadMarcas.ToList())
            {
                _context.PrioridadMarcas.Remove(prioridadActual);
            }
            marca.PrioridadMarcas.Clear();
            foreach (var prioridadDto in marcaDto.PrioridadMarca)
            {
                var prioridad = new PrioridadMarca
                {
                    CodigoPais = prioridadDto.CodigoPais,
                    Numero = prioridadDto.Numero,
                    Fecha = prioridadDto.Fecha
                };
                marca.PrioridadMarcas.Add(prioridad);
            }

            foreach (var publicacionActual in marca.PublicacionMarcas.ToList())
            {
                _context.PublicacionMarcas.Remove(publicacionActual);
            }
            marca.PublicacionMarcas.Clear();
            foreach (var publicacionDto in marcaDto.Publicaciones)
            {
                var publicacion = new PublicacionMarca
                {
                    TipoPublicacionId = publicacionDto.TipoPublicacionId,
                    NumeroGaceta = publicacionDto.NumeroGaceta,
                    Pagina = publicacionDto.Pagina
                };
                marca.PublicacionMarcas.Add(publicacion);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MarcaExists(id))
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

        public class MarcaPatchDTO
        {
            public bool TieneFigura { get; set; }
        }


        // PATCH: api/Marcas/5/TieneFigura
        [HttpPatch("{id}/TieneFigura")]
        public async Task<IActionResult> PatchMarcaTieneFigura(int id, [FromBody] MarcaPatchDTO marcaPatchDto)
        {
            var marca = await _context.Marcas.FindAsync(id);
            if (marca == null)
            {
                return NotFound();
            }

            marca.TieneFigura = marcaPatchDto.TieneFigura;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MarcaExists(id))
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


        // DELETE: api/Marcas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarca(int id)
        {
            var marca = await _context.Marcas
                .Include(m => m.Contactos)
                .Include(m => m.Propietarios)
                .Include(m => m.EstadoMarcas)
                .Include(m => m.PrioridadMarcas)
                .Include(m => m.PublicacionMarcas)
                .FirstOrDefaultAsync(m => m.MarcaId == id);

            if (marca == null)
            {
                return NotFound();
            }

            // Limpiar relaciones
            marca.Contactos.Clear();
            marca.Propietarios.Clear();
            marca.EstadoMarcas.Clear();


            foreach (var prioridad in marca.PrioridadMarcas.ToList())
            {
                _context.PrioridadMarcas.Remove(prioridad);
            }

            foreach (var publicacion in marca.PublicacionMarcas.ToList())
            {
                _context.PublicacionMarcas.Remove(publicacion);
            }

            await DeleteCarpetaMarca(id);

            _context.Marcas.Remove(marca);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private async Task DeleteCarpetaMarca(int marcaId)
        {
            string nombreContenedor = "marca";
            string nombreCarpeta = $"marca{marcaId}/";

            var containerClient = _blobServiceClient.GetBlobContainerClient(nombreContenedor);
            if (await containerClient.ExistsAsync())
            {
                await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: nombreCarpeta))
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    await blobClient.DeleteIfExistsAsync();
                }
            }

            var documentos = await _context.ConexionDocumentos
                .Where(d => d.IdConexion == marcaId && d.TablaConexion == "marca")
                .ToListAsync();

            _context.ConexionDocumentos.RemoveRange(documentos);
        }



        private bool MarcaExists(int id)
        {
            return (_context.Marcas?.Any(e => e.MarcaId == id)).GetValueOrDefault();
        }
    }
}
