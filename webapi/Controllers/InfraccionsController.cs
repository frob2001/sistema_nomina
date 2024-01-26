using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.MarcasController;

namespace webapi.Controllers
{
    [Route("Infracciones")]
    [ApiController]
    public class InfraccionsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public InfraccionsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class TipoInfraccionDTO
        {
            public int TipoInfraccionId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class MarcaInfringida
        {
            public int MarcaId { get; set; }
            public ClienteDropDownDTO? Cliente { get; set; }
            public string Signo { get; set; } = null!;
        }

        public class AutoridadDTO
        {
            public int AutoridadId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class InfraccionDTO
        {
            public int InfraccionId { get; set; }
            public TipoInfraccionDTO TipoInfraccion { get; set; }
            public OficinaTramitanteDTO OficinaTramitante { get; set; }
            public ResponsableDTO Abogado { get; set; }
            public MarcaInfringida Marca { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO> Estados { get; set; } = null!;
            public string Infractor { get; set; } = null!;
            public MarcaClaseDTO? ClaseMarca { get; set; }
            public MarcaClaseDTO? ClaseInfractor { get; set; }
            public PaisDTO? PaisMarca { get; set; }
            public PaisDTO? PaisInfractor { get; set; }
            public CasoInfraccionDTO? Caso { get; set; }
            public AutoridadDTO Autoridad { get; set; }
            public string? NumeroProceso { get; set; }
            public string? NumeroProcesoJudicial { get; set; }
            public string? CodigoDai { get; set; }
            public DateTime? FechaRegistro { get; set; }
        }

        public class InfraccionGeneralDTO
        {
            public int InfraccionId { get; set; }
            public string? TipoInfraccion { get; set; }
            public string? OficinaTramitante { get; set; }
            public string? Abogado { get; set; }
            public string? Marca { get; set; }
            public string? Cliente { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO> Estados { get; set; } = null!;
            public string Infractor { get; set; } = null!;
            public int? ClaseMarca { get; set; }
            public int? ClaseInfractor { get; set; }
            public string? PaisMarca { get; set; }
            public string? PaisInfractor { get; set; }
            public string? Caso { get; set; }
            public string? Autoridad { get; set; }
            public string? NumeroProceso { get; set; }
            public string? NumeroProcesoJudicial { get; set; }
            public string? CodigoDai { get; set; }
            public DateTime? FechaRegistro { get; set; }
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<InfraccionGeneralDTO>>> SearchInfracciones(
            string? DropdownSearch,
            int? infraccionId,
            int? tipoInfraccionId,
            int? casoInfraccionId,
            int? oficinaTramitanteId,
            int? abogadoId,
            string? codigoPaisMarca,
            string? codigoPaisInfractor,
            int? claseMarca,
            int? claseInfractor,
            string? estadoId,
            int? marcaId,
            string? referencia,
            string? infractor,
            int? autoridadId,
            string? numeroProceso,
            string? numeroProcesoJudicial,
            string? codigoDai,
            DateTime? fechaRegistroDesde,
            DateTime? fechaRegistroHasta,
            bool cantidad
        )
        {
            if (_context.Infraccions == null)
            {
                return NotFound();
            }

            var query = _context.Infraccions.AsQueryable();

            cantidad = false;
            if (!string.IsNullOrWhiteSpace(DropdownSearch))
            {
                query = query.Where(i => i.ReferenciaInterna.Contains(DropdownSearch) || i.InfraccionId.ToString().Contains(DropdownSearch));
                cantidad = true;
            }
            if (!string.IsNullOrEmpty(infraccionId.ToString()))
                query = query.Where(i => i.InfraccionId.ToString().Contains(infraccionId.ToString()));
            if (tipoInfraccionId.HasValue)
                query = query.Where(i => i.TipoInfraccionId == tipoInfraccionId.Value);

            if (casoInfraccionId.HasValue)
            {
                query = query.Where(i => i.CasoInfraccions.Any(ci => ci.CasoInfraccionId == casoInfraccionId.Value));
            }
            if (oficinaTramitanteId.HasValue)
                query = query.Where(i => i.OficinaTramitanteNavigation.ClienteId == oficinaTramitanteId.Value);
            if (abogadoId.HasValue)
                query = query.Where(i => i.AbogadoId == abogadoId.Value);
            if (marcaId.HasValue)
                query = query.Where(i => i.MarcaId == marcaId.Value);
            if (!string.IsNullOrEmpty(estadoId))
            {
                query = query.Where(i => i.EstadoInfraccions.Any(e => e.Estado.Codigo == estadoId));
            }
            if (!string.IsNullOrEmpty(referencia))
            {
                query = query.Where(i => i.ReferenciaInterna.Contains(referencia) ||
                                         i.Referencia.Any(r => r.Referencia.Contains(referencia)));
            }
            if (!string.IsNullOrEmpty(codigoPaisMarca))
                query = query.Where(i => i.CodigoPaisMarca == codigoPaisMarca);
            if (!string.IsNullOrEmpty(codigoPaisInfractor))
                query = query.Where(i => i.CodigoPaisInfractor == codigoPaisInfractor);
            if (claseMarca.HasValue)
                query = query.Where(i => i.ClaseMarca == claseMarca.Value);
            if (claseInfractor.HasValue)
                query = query.Where(i => i.ClaseInfractor == claseInfractor.Value);
            if (!string.IsNullOrEmpty(infractor))
                query = query.Where(i => i.Infractor.Contains(infractor));
            if (autoridadId.HasValue)
                query = query.Where(i => i.AutoridadId == autoridadId.Value);
            if (!string.IsNullOrEmpty(numeroProceso))
                query = query.Where(i => i.NumeroProceso == numeroProceso);
            if (!string.IsNullOrEmpty(numeroProcesoJudicial))
                query = query.Where(i => i.NumeroProcesoJudicial == numeroProcesoJudicial);
            if (!string.IsNullOrEmpty(codigoDai))
                query = query.Where(i => i.CodigoDai == codigoDai);
            if (fechaRegistroDesde.HasValue)
            {
                query = query.Where(i => i.FechaRegistro >= fechaRegistroDesde.Value);
            }
            if (fechaRegistroHasta.HasValue)
            {
                query = query.Where(i => i.FechaRegistro <= fechaRegistroHasta.Value);
            }

            query = query
                .Include(i => i.TipoInfraccion)
                .Include(i => i.OficinaTramitanteNavigation)
                .Include(i => i.Abogado)
                .Include(i => i.CasoInfraccions)
                .Include(i => i.EstadoInfraccions)
                .Include(i => i.Marca);

            var resultados = new List<InfraccionGeneralDTO>();
            if (cantidad)
            {
                resultados = await query.Select(i => new InfraccionGeneralDTO
                {
                    InfraccionId = i.InfraccionId,
                    ReferenciaInterna = i.ReferenciaInterna
                }).ToListAsync();
            }
            else
            {
                resultados = await query.Select(i => new InfraccionGeneralDTO
                {
                    InfraccionId = i.InfraccionId,
                    TipoInfraccion = i.TipoInfraccion.Nombre,
                    OficinaTramitante = i.OficinaTramitanteNavigation.Nombre,
                    Abogado = i.Abogado.Nombre + " " + i.Abogado.Apellido,
                    Marca = i.MarcaId + " " + i.Marca.Signo,
                    Cliente = i.Marca.Cliente.CodigoPaisNavigation.Nombre + ": " + i.Marca.Cliente.ClienteId + " " + i.Marca.Cliente.Nombre,
                    PaisMarca = i.CodigoPaisMarcaNavigation.Nombre,
                    ClaseMarca = i.ClaseMarca,
                    ReferenciaInterna = i.ReferenciaInterna,
                    Referencias = i.Referencia.Select(rr => new ReferenciaDTO
                    {
                        ReferenciaId = rr.ReferenciaId,
                        TipoReferenciaId = rr.TipoReferenciaId,
                        TipoReferencia = rr.TipoReferencia.Nombre,
                        Referencia = rr.Referencia
                    }).ToList(),
                    Estados = i.EstadoInfraccions.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    Infractor = i.Infractor,
                    PaisInfractor = i.CodigoPaisInfractorNavigation.Nombre,
                    ClaseInfractor = i.ClaseInfractor,
                    Caso = string.Join(", ", i.CasoInfraccions.Select(ci => ci.NumeroCasoInfraccion)),
                    Autoridad = i.Autoridad.Nombre,
                    NumeroProceso = i.NumeroProceso,
                    NumeroProcesoJudicial = i.NumeroProcesoJudicial,
                    CodigoDai = i.CodigoDai,
                    FechaRegistro = i.FechaRegistro
                }).ToListAsync();
            }



            return resultados;
        }


        // GET: api/Infraccions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InfraccionDTO>> GetInfraccion(int id)
        {
          if (_context.Infraccions == null)
          {
              return NotFound();
          }
            var infraccion = await _context.Infraccions
                .Where(i => i.InfraccionId == id)
                .Include(i => i.TipoInfraccion)
                .Include(i => i.OficinaTramitanteNavigation)
                .Include(i => i.Abogado)
                .Include(i => i.EstadoInfraccions)
                .Select(i => new InfraccionDTO
                {
                    InfraccionId = i.InfraccionId,
                    TipoInfraccion = new TipoInfraccionDTO
                    {
                        TipoInfraccionId = i.TipoInfraccionId,
                        Nombre = i.TipoInfraccion.Nombre
                    },
                    OficinaTramitante = new OficinaTramitanteDTO
                    {
                        ClienteId = i.OficinaTramitanteNavigation.ClienteId,
                        Nombre = i.OficinaTramitanteNavigation.Nombre
                    },
                    Abogado = new ResponsableDTO
                    {
                        AbogadoId = i.Abogado.AbogadoId,
                        Nombre = i.Abogado.Nombre,
                        Apellido = i.Abogado.Apellido
                    },
                    Marca = new MarcaInfringida
                    {
                        MarcaId = i.Marca.MarcaId,
                        Cliente = new ClienteDropDownDTO
                        {
                            ClienteId = i.Marca.Cliente.ClienteId,
                            Nombre = i.Marca.Cliente.Nombre
                        },
                        Signo = i.Marca.Signo
                    },
                    PaisMarca = new PaisDTO
                    {
                        CodigoPais = i.CodigoPaisMarcaNavigation.CodigoPais,
                        Nombre = i.CodigoPaisMarcaNavigation.Nombre
                    },
                    ClaseMarca = new MarcaClaseDTO
                    {
                        CodigoClase = i.ClaseMarcaNavigation.Codigo,
                        CoberturaEspanol = i.ClaseMarcaNavigation.DescripcionEspanol,
                        CoberturaIngles = i.ClaseMarcaNavigation.DescripcionIngles
                    },
                    ReferenciaInterna = i.ReferenciaInterna,
                    Referencias = i.Referencia.Select(rr => new ReferenciaDTO
                    {
                        ReferenciaId = rr.ReferenciaId,
                        TipoReferenciaId = rr.TipoReferenciaId,
                        TipoReferencia = rr.TipoReferencia.Nombre,
                        Referencia = rr.Referencia
                    }).ToList(),
                    Estados = i.EstadoInfraccions.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    Infractor = i.Infractor,
                    PaisInfractor = new PaisDTO
                    {
                        CodigoPais = i.CodigoPaisInfractorNavigation.CodigoPais,
                        Nombre = i.CodigoPaisInfractorNavigation.Nombre
                    },
                    ClaseInfractor = new MarcaClaseDTO
                    {
                        CodigoClase = i.ClaseInfractorNavigation.Codigo,
                        CoberturaEspanol = i.ClaseInfractorNavigation.DescripcionEspanol,
                        CoberturaIngles = i.ClaseInfractorNavigation.DescripcionIngles
                    },
                    Caso = i.CasoInfraccions.Select(ci => new CasoInfraccionDTO
                    {
                        CasoInfraccionId = ci.CasoInfraccionId,
                        NumeroCasoInfraccion = ci.NumeroCasoInfraccion
                    }).FirstOrDefault(),
                    Autoridad = new AutoridadDTO
                    {
                        AutoridadId = i.Autoridad.AutoridadId,
                        Nombre = i.Autoridad.Nombre
                    },
                    NumeroProceso = i.NumeroProceso,
                    NumeroProcesoJudicial = i.NumeroProcesoJudicial,
                    CodigoDai = i.CodigoDai,
                    FechaRegistro = i.FechaRegistro
                })
                .FirstOrDefaultAsync();
            if (infraccion == null)
            {
                return NotFound();
            }

            return infraccion;
        }

        public class InfraccionInputDTO
        {
            public int InfraccionId { get; set; }
            public int TipoInfraccionId { get; set; }
            public int OficinaTramitanteId { get; set; }    
            public int AbogadoId { get; set; }
            public int? CasoInfraccionId { get; set; }
            public int MarcaId { get; set; }
            public int? ClaseMarca { get; set; }
            public int? ClaseInfractor { get; set; }
            public string? CodigoPaisMarca { get; set; }
            public string? CodigoPaisInfractor { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<string>? Estados { get; set; }
            public string Infractor { get; set; } = null!;
            public int AutoridadId { get; set; }
            public string? NumeroProceso { get; set; }
            public string? NumeroProcesoJudicial { get; set; }
            public string? CodigoDai { get; set; }
            public List<ReferenciaDTO>? Referencias { get; set; }
            public DateTime? FechaRegistro { get; set; }
        }

        // POST: api/Infraccions
        [HttpPost]
        public async Task<ActionResult<Infraccion>> PostInfraccion(InfraccionInputDTO infraccionDto)
        {
            if (_context.Infraccions == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Infraccions' is null.");
            }

            var infraccion = new Infraccion
            {
                TipoInfraccionId = infraccionDto.TipoInfraccionId,
                OficinaTramitante = infraccionDto.OficinaTramitanteId,
                AbogadoId = infraccionDto.AbogadoId,
                MarcaId = infraccionDto.MarcaId,
                CodigoPaisMarca = infraccionDto.CodigoPaisMarca,
                ClaseMarca = infraccionDto.ClaseMarca,
                ReferenciaInterna = infraccionDto.ReferenciaInterna,
                Infractor = infraccionDto.Infractor,
                CodigoPaisInfractor = infraccionDto.CodigoPaisInfractor,
                ClaseInfractor = infraccionDto.ClaseInfractor,
                AutoridadId = infraccionDto.AutoridadId,
                NumeroProceso = infraccionDto.NumeroProceso,
                NumeroProcesoJudicial = infraccionDto.NumeroProcesoJudicial,
                CodigoDai = infraccionDto.CodigoDai,
                FechaRegistro = infraccionDto.FechaRegistro
            };

            foreach (var referenciaDto in infraccionDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                infraccion.Referencia.Add(referencia);
            }

            if (infraccionDto.Estados != null)
            {
                foreach (var estadoId in infraccionDto.Estados)
                {
                    var estado = await _context.Estados.FindAsync(estadoId);
                    if (estado != null)
                    {
                        infraccion.EstadoInfraccions.Add(new EstadoInfraccion { EstadoId = estadoId });
                    }
                }
            }


            if (infraccionDto.CasoInfraccionId.HasValue)
            {
                var caso = await _context.CasoInfraccions
                    .FirstOrDefaultAsync(c => c.CasoInfraccionId == infraccionDto.CasoInfraccionId.Value);
                if (caso != null)
                {
                    infraccion.CasoInfraccions.Add(caso);
                }
            }

            _context.Infraccions.Add(infraccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInfraccion", new { id = infraccion.InfraccionId }, infraccion);
        }

        // PUT: api/Infraccions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInfraccion(int id, InfraccionInputDTO infraccionDto)
        {
            var infraccion = await _context.Infraccions
                .Include(i => i.CasoInfraccions)
                .FirstOrDefaultAsync(i => i.InfraccionId == id);

            if (infraccion == null)
            {
                return NotFound();
            }

            infraccion.TipoInfraccionId = infraccionDto.TipoInfraccionId;
            infraccion.OficinaTramitante = infraccionDto.OficinaTramitanteId;
            infraccion.AbogadoId = infraccionDto.AbogadoId;
            infraccion.MarcaId = infraccionDto.MarcaId;
            infraccion.CodigoPaisMarca = infraccionDto.CodigoPaisMarca;
            infraccion.ClaseMarca = infraccionDto.ClaseMarca;
            infraccion.ReferenciaInterna = infraccionDto.ReferenciaInterna;
            infraccion.Infractor = infraccionDto.Infractor;
            infraccion.CodigoPaisInfractor = infraccionDto.CodigoPaisInfractor;
            infraccion.ClaseInfractor = infraccionDto.ClaseInfractor;
            infraccion.AutoridadId = infraccionDto.AutoridadId;
            infraccion.NumeroProceso = infraccionDto.NumeroProceso;
            infraccion.NumeroProcesoJudicial = infraccionDto.NumeroProcesoJudicial;
            infraccion.CodigoDai = infraccionDto.CodigoDai;
            infraccion.FechaRegistro = infraccionDto.FechaRegistro;

            // Referencias
            infraccion.Referencia.Clear();
            foreach (var referenciaDto in infraccionDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                infraccion.Referencia.Add(referencia);
            }
          
            infraccion.EstadoInfraccions.Clear();
            foreach (var estadoCodigo in infraccionDto.Estados)
            {
                var estado = await _context.Estados.FirstOrDefaultAsync(e => e.Codigo == estadoCodigo);
                if (estado != null)
                {
                    infraccion.EstadoInfraccions.Add(new EstadoInfraccion { Estado = estado });
                }
            }

            if (infraccionDto.CasoInfraccionId.HasValue)
            {
                var caso = await _context.CasoInfraccions
                    .FirstOrDefaultAsync(c => c.CasoInfraccionId == infraccionDto.CasoInfraccionId.Value);
                if (caso != null)
                {
                    infraccion.CasoInfraccions.Clear();
                    infraccion.CasoInfraccions.Add(caso);
                }
            }
            else
            {
                infraccion.CasoInfraccions.Clear();
            }

            _context.Entry(infraccion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InfraccionExists(id))
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



        // DELETE: api/Infraccions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfraccion(int id)
        {
            var infraccion = await _context.Infraccions
                .Include(i => i.Referencia)
                .Include(i => i.EstadoInfraccions)
                .FirstOrDefaultAsync(i => i.InfraccionId == id);

            

            if (infraccion == null)
            {
                return NotFound();
            }

            infraccion.EstadoInfraccions.Clear();
            infraccion.Referencia.Clear();
            _context.Infraccions.Remove(infraccion);

            await _context.SaveChangesAsync();

            return NoContent();
        }
        

        private bool InfraccionExists(int id)
        {
            return (_context.Infraccions?.Any(e => e.InfraccionId == id)).GetValueOrDefault();
        }
    }
}
