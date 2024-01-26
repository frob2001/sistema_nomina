using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using webapi.Models;
using static webapi.Controllers.MarcasController;

namespace webapi.Controllers
{
    [Route("AccionTerceros")]
    [ApiController]
    public class AccionTerceroesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public AccionTerceroesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class TipoAccionGeneralDTO
        {
            public int TipoAccionId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class propietarioDropDownDTO
        {
            public int? PropietarioId { get; set; } //dd
            public string? Nombre { get; set; } //dd
        }


        public class MarcaBaseDTO
        {
            public int MarcaId { get; set; }
            public string Signo { get; set; } = null!;
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public int? Clase { get; set; }
            public PaisDTO CodigoPais { get; set; } = null!;
            public string? Propietario { get; set; }
            public propietarioDropDownDTO? PropietarioDD { get; set; }
        }

        public class MarcaOpuestaDTO
        {
            public int MarcaOpuestaId { get; set; }
            public string Denominacion { get; set; } = null!;
            public int? Clase { get; set; }
            public PaisDTO? CodigoPais { get; set; }
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Propietario { get; set; }
            public string? Agente { get; set; }
            public int? Gaceta { get; set; }
            public DateTime? Fecha { get; set; }
        }

        public class AccionTerceroDTO
        {
            public int AccionTerceroId { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public TipoAccionGeneralDTO TipoAccion { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public OficinaTramitanteDTO OficinaTramitante { get; set; }
            public ClienteDropDownDTO? Cliente { get; set; }
            public ResponsableDTO? Abogado { get; set; }
            public List<MarcaBaseDTO> MarcasBase { get; set; }
            public MarcaOpuestaDTO MarcaOpuesta { get; set; }
        }

        public class AccionTerceroGeneralDTO
        {
            public int AccionTerceroId { get; set; }
            public string ReferenciaInterna { get; set; } = null!;
            public List<ReferenciaDTO>? Referencias { get; set; }
            public string TipoAccion { get; set; }
            public string OficinaTramitante { get; set; }
            public string? Cliente { get; set; }
            public string? Abogado { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public List<MarcaBaseDTO> MarcasBase { get; set; }
            public string? Demandado { get; set; }
            public string? Objeto { get; set; }
            public string? Solicitud { get; set; }
            public string? Pais { get; set; }
            public DateTime? FechaSolicitudOpuesta { get; set; }
            public MarcaOpuestaDTO MarcaOpuesta { get; set; }
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<AccionTerceroGeneralDTO>>> GetAccionTerceros(
            int? accionId,
            int? TipoAccionId,
            int? oficinaTramitanteId,
            int? abogadoId,
            string? estadoId,
            string? referencia,
            int? marcaBaseId,
            int? claseBaseId,
            string? codigoPaisBase,
            string? solicitudBase,
            string? registroBase,
            int? porpietarioBase,
            string? marcaOpuesta,
            int? claseOpuestaId,
            string? codigoPaisOpuesta,
            string? solicitudOpuesta,
            string? registroOpuesta,
            string? propietarioOpuesta,
            string? agente,
            int? gaceta,
            int? cliente,
            DateTime? fechaGacetaDesde,
            DateTime? fechaGacetaHasta
            )
        {
            if (_context.AccionTerceros == null)
            {
                return NotFound();
            }

            var query = _context.AccionTerceros.AsQueryable();
            if (!string.IsNullOrEmpty(accionId.ToString()))
            {
                query = query.Where(a => a.AccionTerceroId.ToString().Contains(accionId.ToString()));
            }
            if (TipoAccionId.HasValue)
            {
                query = query.Where(a => a.TipoAccionId == TipoAccionId.Value);
            }
            if (oficinaTramitanteId.HasValue)
            {
                query = query.Where(a => a.OficinaTramitante == oficinaTramitanteId.Value);
            }
            if (abogadoId.HasValue)
            {
                query = query.Where(a => a.AbogadoId == abogadoId.Value);
            }
            if (!string.IsNullOrEmpty(estadoId))
            {
                query = query.Where(a => a.EstadoAcciones.Any(e => e.Estado.Codigo == estadoId));
            }
            if (!string.IsNullOrEmpty(referencia))
            {
                query = query.Where(a => a.ReferenciaInterna.Contains(referencia) ||
                                         a.Referencia.Any(r => r.Referencia.Contains(referencia)));
            }
            if (marcaBaseId.HasValue)
            {
                query = query.Where(a => a.MarcaBases.Any(m => m.MarcaId == marcaBaseId));
            }
            if (claseBaseId.HasValue)
            {
                query = query.Where(a => a.MarcaBases.Any(m => m.Clase == claseBaseId));
            }
            if (!string.IsNullOrEmpty(codigoPaisBase))
            {
                query = query.Where(a => a.MarcaBases.Any(p => p.CodigoPais == codigoPaisBase));
            }
            if (!string.IsNullOrEmpty(solicitudBase))
            {
                query = query.Where(a => a.MarcaBases.Any(p => p.Marca.Solicitud == solicitudBase));
            }
            if (!string.IsNullOrEmpty(registroBase))
            {
                query = query.Where(a => a.MarcaBases.Any(p => p.Marca.Registro == registroBase));
            }
            if (porpietarioBase.HasValue)
            {
                query = query.Where(a => a.MarcaBases.Any(m => m.Marca.Propietarios.Any(p => p.PropietarioId == porpietarioBase)));
            }
            if (!string.IsNullOrEmpty(marcaOpuesta))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Denominacion.Contains(marcaOpuesta));
            }
            if (claseOpuestaId.HasValue)
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.ClaseNavigation.Codigo == claseOpuestaId);
            }
            if (!string.IsNullOrEmpty(codigoPaisOpuesta))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.CodigoPais.Contains(codigoPaisOpuesta));
            }
            if (!string.IsNullOrEmpty(solicitudOpuesta))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Solicitud.Contains(solicitudOpuesta));
            }
            if (!string.IsNullOrEmpty(registroOpuesta))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Solicitud.Contains(registroOpuesta));
            }
            if (!string.IsNullOrEmpty(propietarioOpuesta))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Propietario.Contains(propietarioOpuesta));
            }
            if (!string.IsNullOrEmpty(agente))
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Agente.Contains(agente));
            }
            if (gaceta.HasValue)
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Gaceta == gaceta.Value);
            }
            if (fechaGacetaDesde.HasValue)
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Fecha >= fechaGacetaDesde.Value);
            }
            if (fechaGacetaHasta.HasValue)
            {
                query = query.Where(a => a.MarcaOpuestaNavigation.Fecha <= fechaGacetaHasta.Value);
            }
            if (cliente.HasValue)
            {
                query = query.Where(a => a.ClienteId == cliente.Value);
            }
            var resultado = await query
                .Select(at => new AccionTerceroGeneralDTO
                {
                    AccionTerceroId = at.AccionTerceroId,
                    ReferenciaInterna = at.ReferenciaInterna,
                    Referencias = at.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    TipoAccion = at.TipoAccion.Nombre,
                    Cliente = at.Cliente.CodigoPaisNavigation.Nombre + ": " + at.Cliente.ClienteId + " " + at.Cliente.Nombre,
                    OficinaTramitante = at.OficinaTramitanteNavigation.Nombre,
                    Abogado = at.Abogado.Nombre + " " + at.Abogado.Apellido,
                    Estados = at.EstadoAcciones.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    MarcasBase = at.MarcaBases.Select(m => new MarcaBaseDTO
                    {
                        MarcaId = m.Marca.MarcaId,
                        Signo = m.Marca.Signo,
                        Clase = m.Clase,
                        CodigoPais = new PaisDTO
                        {
                            CodigoPais = m.CodigoPaisNavigation.CodigoPais,
                            Nombre = m.CodigoPaisNavigation.Nombre
                        },
                        Propietario = m.PropietarioNavigation.Nombre,
                        PropietarioDD = new propietarioDropDownDTO
                        {
                            PropietarioId = m.PropietarioNavigation.PropietarioId,
                            Nombre = m.PropietarioNavigation.Nombre
                        }
                    }).ToList(),
                    Demandado = at.MarcaOpuestaNavigation.Propietario,
                    Objeto = at.MarcaOpuestaNavigation.Denominacion,
                    Solicitud = at.MarcaOpuestaNavigation.Solicitud,
                    Pais = at.MarcaOpuestaNavigation.CodigoPaisNavigation.Nombre,
                    FechaSolicitudOpuesta  = at.MarcaOpuestaNavigation.FechaSolicitud
                })
                .ToListAsync();

            return resultado;
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<AccionTerceroDTO>> GetAccionTercero(int id)
        {
          if (_context.AccionTerceros == null)
          {
              return NotFound();
          }
            var accionTercero = await _context.AccionTerceros
                .Where(at => at.AccionTerceroId == id)
                .Include(at => at.TipoAccion)
                .Include(at => at.OficinaTramitanteNavigation)
                .Include(at => at.Abogado)
                .Include(at => at.MarcaBases)
                .Include(at => at.Referencia)
                .Include(at => at.MarcaOpuestaNavigation)
                .Select(at => new AccionTerceroDTO
                {
                    AccionTerceroId = at.AccionTerceroId,
                    ReferenciaInterna = at.ReferenciaInterna,
                    Referencias = at.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferencia.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    TipoAccion = new TipoAccionGeneralDTO
                    {
                        TipoAccionId = at.TipoAccionId,
                        Nombre = at.TipoAccion.Nombre
                    },
                    Cliente = new ClienteDropDownDTO
                    {
                        ClienteId = at.ClienteId,
                        Nombre = at.Cliente.Nombre,
                    },
                    OficinaTramitante = new OficinaTramitanteDTO
                    {
                        ClienteId = at.OficinaTramitanteNavigation.ClienteId,
                        Nombre = at.OficinaTramitanteNavigation.Nombre,
                    },
                    Abogado = new ResponsableDTO
                    {
                        AbogadoId = at.Abogado.AbogadoId,
                        Nombre = at.Abogado.Nombre,
                        Apellido = at.Abogado.Apellido
                    },
                    Estados = at.EstadoAcciones.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    MarcasBase = at.MarcaBases.Select(m => new MarcaBaseDTO
                    {
                        MarcaId = m.Marca.MarcaId,
                        Signo = m.Marca.Signo,
                        Solicitud = m.Marca.Solicitud,
                        FechaSolicitud = m.Marca.FechaSolicitud,
                        Registro = m.Marca.Registro,
                        FechaRegistro = m.Marca.FechaRegistro,
                        Clase = m.Clase,
                        CodigoPais = new PaisDTO
                        {
                            CodigoPais = m.CodigoPaisNavigation.CodigoPais,
                            Nombre = m.CodigoPaisNavigation.Nombre
                        },
                        Propietario = m.PropietarioNavigation.Nombre,
                        PropietarioDD = new propietarioDropDownDTO
                        {
                            PropietarioId = m.PropietarioNavigation.PropietarioId,
                            Nombre = m.PropietarioNavigation.Nombre
                        }
                    }).ToList(),
                    MarcaOpuesta = new MarcaOpuestaDTO
                    {
                        MarcaOpuestaId = at.MarcaOpuestaNavigation.MarcaOpuestaId,
                        Denominacion = at.MarcaOpuestaNavigation.Denominacion,
                        Clase = at.MarcaOpuestaNavigation.Clase,
                        CodigoPais = new PaisDTO
                        {
                            CodigoPais = at.MarcaOpuestaNavigation.CodigoPaisNavigation.CodigoPais,
                            Nombre = at.MarcaOpuestaNavigation.CodigoPaisNavigation.Nombre
                        },
                        Solicitud = at.MarcaOpuestaNavigation.Solicitud,
                        FechaSolicitud = at.MarcaOpuestaNavigation.FechaSolicitud,
                        Registro = at.MarcaOpuestaNavigation.Registro,
                        FechaRegistro = at.MarcaOpuestaNavigation.FechaRegistro,
                        Propietario = at.MarcaOpuestaNavigation.Propietario,
                        Agente = at.MarcaOpuestaNavigation.Agente,
                        Gaceta = at.MarcaOpuestaNavigation.Gaceta,
                        Fecha =at.MarcaOpuestaNavigation.Fecha
                    }
                })
                .FirstOrDefaultAsync();

            if (accionTercero == null)
            {
                return NotFound();
            }

            return accionTercero;
        }

        public class MarcaBaseInputDTO
        {
            public int MarcaId { get; set; }
            public int? Clase { get; set; }
            public string? CodigoPais { get; set; }
            public int? Propietario { get; set; }
        }

        public class MarcaOpuestaInputDTO
        {
            public string Denominacion { get; set; } = null!;
            public int? Clase { get; set; }
            public string? CodigoPais { get; set; }
            public string? Solicitud { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Propietario { get; set; }
            public string? Agente { get; set; }
            public int? Gaceta { get; set; }
            public DateTime? Fecha { get; set; }
        }

        public class AccionTerceroInputDTO
        {
            public int AccionTerceroId { get; set; }
            public int TipoAccionId { get; set; }
            public int OficinaTramitante { get; set; }
            public int AbogadoId { get; set; }
            public List<string>? Estados { get; set; }
            public List<MarcaBaseInputDTO> MarcaBase { get; set; } = new List<MarcaBaseInputDTO>();
            public MarcaOpuestaInputDTO MarcaOpuesta { get; set; }
            public List<ReferenciaDTO> Referencias { get; set; } = new List<ReferenciaDTO>();
            public string ReferenciaInterna { get; set; } = null!;
            public int ClienteId { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<AccionTercero>> PostAccionTercero(AccionTerceroInputDTO accionTerceroInputDTO)
        {
            var accionTercero = new AccionTercero
            {
                ClienteId = accionTerceroInputDTO.ClienteId,
                TipoAccionId = accionTerceroInputDTO.TipoAccionId,
                OficinaTramitante = accionTerceroInputDTO.OficinaTramitante,
                AbogadoId = accionTerceroInputDTO.AbogadoId,
                ReferenciaInterna = accionTerceroInputDTO.ReferenciaInterna,
            };

            // Agregar MarcaBase
            foreach (var marcaBaseInput in accionTerceroInputDTO.MarcaBase)
            {
                var marcaBase = new MarcaBase
                {
                    MarcaId = marcaBaseInput.MarcaId,
                    Clase = marcaBaseInput.Clase,
                    CodigoPais = marcaBaseInput.CodigoPais,
                    Propietario = marcaBaseInput.Propietario
                };
                accionTercero.MarcaBases.Add(marcaBase);
            }

            foreach (var referenciaDto in accionTerceroInputDTO.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                accionTercero.Referencia.Add(referencia);
            }

            // Estados
            if (accionTerceroInputDTO.Estados != null)
            {
                foreach (var estadoId in accionTerceroInputDTO.Estados)
                {
                    var estado = await _context.Estados.FindAsync(estadoId);
                    if (estado != null)
                    {
                        accionTercero.EstadoAcciones.Add(new EstadoAccion { EstadoId = estadoId });
                    }
                }
            }

            // Agregar MarcaOpuesta
            if (accionTerceroInputDTO.MarcaOpuesta != null)
            {
                var marcaOpuesta = new MarcaOpuestum
                {
                    Denominacion = accionTerceroInputDTO.MarcaOpuesta.Denominacion,
                    Clase = accionTerceroInputDTO.MarcaOpuesta.Clase,
                    CodigoPais = accionTerceroInputDTO.MarcaOpuesta.CodigoPais,
                    Solicitud = accionTerceroInputDTO.MarcaOpuesta.Solicitud,
                    FechaSolicitud = accionTerceroInputDTO.MarcaOpuesta.FechaSolicitud,
                    Registro = accionTerceroInputDTO.MarcaOpuesta.Registro,
                    FechaRegistro = accionTerceroInputDTO.MarcaOpuesta.FechaRegistro,
                    Propietario = accionTerceroInputDTO.MarcaOpuesta.Propietario,
                    Agente = accionTerceroInputDTO.MarcaOpuesta.Agente,
                    Gaceta = accionTerceroInputDTO.MarcaOpuesta.Gaceta,
                    Fecha = accionTerceroInputDTO.MarcaOpuesta.Fecha,
                };

                accionTercero.MarcaOpuestaNavigation = marcaOpuesta;
            }

            _context.AccionTerceros.Add(accionTercero);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAccionTercero), new { id = accionTercero.AccionTerceroId }, accionTercero);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccionTercero(int id, AccionTerceroInputDTO accionTerceroInputDTO)
        {
            var accionTercero = await _context.AccionTerceros
                .Include(at => at.MarcaBases)
                .Include(at => at.MarcaOpuestaNavigation)
                .Include(at => at.Referencia)
                .Include(at => at.EstadoAcciones)
                .FirstOrDefaultAsync(at => at.AccionTerceroId == id);

            if (accionTercero == null)
            {
                return NotFound();
            }

            // Actualizar propiedades básicas de AccionTercero
            accionTercero.TipoAccionId = accionTerceroInputDTO.TipoAccionId;
            accionTercero.OficinaTramitante = accionTerceroInputDTO.OficinaTramitante;
            accionTercero.AbogadoId = accionTerceroInputDTO.AbogadoId;
            accionTercero.ReferenciaInterna = accionTerceroInputDTO.ReferenciaInterna;
            accionTercero.ClienteId = accionTerceroInputDTO.ClienteId;

            // Limpiar y reemplazar MarcaBase
            accionTercero.MarcaBases.Clear();
            foreach (var marcaBaseInput in accionTerceroInputDTO.MarcaBase)
            {
                var nuevaMarcaBase = new MarcaBase
                {
                    MarcaId = marcaBaseInput.MarcaId,
                    Clase = marcaBaseInput.Clase,
                    CodigoPais = marcaBaseInput.CodigoPais,
                    Propietario = marcaBaseInput.Propietario
                };
                accionTercero.MarcaBases.Add(nuevaMarcaBase);
            }


            foreach (var referenciaActual in accionTercero.Referencia.ToList())
            {
                _context.Referencia.Remove(referenciaActual);
            }
            accionTercero.Referencia.Clear();
            foreach (var referenciaDto in accionTerceroInputDTO.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                accionTercero.Referencia.Add(referencia);
            }


            accionTercero.EstadoAcciones.Clear();
            foreach (var estadoCodigo in accionTerceroInputDTO.Estados)
            {
                var estado = await _context.Estados.FirstOrDefaultAsync(e => e.Codigo == estadoCodigo);
                if (estado != null)
                {
                    accionTercero.EstadoAcciones.Add(new EstadoAccion { Estado = estado });
                }
            }

            // Actualizar MarcaOpuesta
            if (accionTerceroInputDTO.MarcaOpuesta != null)
            {
                var marcaOpuesta = accionTercero.MarcaOpuestaNavigation ?? new MarcaOpuestum();
                marcaOpuesta.Denominacion = accionTerceroInputDTO.MarcaOpuesta.Denominacion;
                marcaOpuesta.Clase = accionTerceroInputDTO.MarcaOpuesta.Clase;
                marcaOpuesta.CodigoPais = accionTerceroInputDTO.MarcaOpuesta.CodigoPais;
                marcaOpuesta.Solicitud = accionTerceroInputDTO.MarcaOpuesta.Solicitud;
                marcaOpuesta.FechaSolicitud = accionTerceroInputDTO.MarcaOpuesta.FechaSolicitud;
                marcaOpuesta.Registro = accionTerceroInputDTO.MarcaOpuesta.Registro;
                marcaOpuesta.FechaRegistro = accionTerceroInputDTO.MarcaOpuesta.FechaRegistro;
                marcaOpuesta.Propietario = accionTerceroInputDTO.MarcaOpuesta.Propietario;
                marcaOpuesta.Agente = accionTerceroInputDTO.MarcaOpuesta.Agente;
                marcaOpuesta.Gaceta = accionTerceroInputDTO.MarcaOpuesta.Gaceta;
                marcaOpuesta.Fecha = accionTerceroInputDTO.MarcaOpuesta.Fecha;

                if (accionTercero.MarcaOpuestaNavigation == null)
                {
                    accionTercero.MarcaOpuestaNavigation = marcaOpuesta;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccionTerceroExists(id))
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
        public async Task<IActionResult> DeleteAccionTercero(int id)
        {
            var accionTercero = await _context.AccionTerceros
                .Include(at => at.MarcaBases)
                .Include(at => at.MarcaOpuestaNavigation)
                .FirstOrDefaultAsync(at => at.AccionTerceroId == id);

            if (accionTercero == null)
            {
                return NotFound();
            }

            // Limpiar MarcaBases
            accionTercero.MarcaBases.Clear();

            // Eliminar AccionTercero
            _context.AccionTerceros.Remove(accionTercero);

            // Eliminar MarcaOpuesta si existe
            if (accionTercero.MarcaOpuestaNavigation != null)
            {
                _context.MarcaOpuesta.Remove(accionTercero.MarcaOpuestaNavigation);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }



        private bool AccionTerceroExists(int id)
        {
            return (_context.AccionTerceros?.Any(e => e.AccionTerceroId == id)).GetValueOrDefault();
        }
    }
}
