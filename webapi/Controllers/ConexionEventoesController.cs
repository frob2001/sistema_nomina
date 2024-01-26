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
    [Route("ConexionEvento")]
    [ApiController]
    public class ConexionEventoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public ConexionEventoesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class EventoDetalleDto
        {
            public int EventoId { get; set; }
            public EstadosDTO EstadoCodigo { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public TipoEventoDto TipoEventoId { get; set; }
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventoDetalleDto>>> GetEventosPorConexion(string tablaConexion, int idConexion)
        {
            var conexionesEventos = await _context.ConexionEventos
                .Where(ce => ce.TablaConexion == tablaConexion && ce.IdConexion == idConexion)
                .ToListAsync();

            if (!conexionesEventos.Any())
            {
                return NotFound("No se encontraron conexiones de eventos.");
            }

            var eventosDetalles = new List<EventoDetalleDto>();

            foreach (var conexionEvento in conexionesEventos)
            {
                switch (conexionEvento.TablaConexionEvento.ToLower())
                {
                    case "evento1":
                        var evento1Detalle = await _context.Evento1s
                            .Where(e => e.EventoId == conexionEvento.IdEvento)
                            .Include(e => e.TipoEvento)
                            .Include(e => e.EstadoCodigoNavigation)
                            .Select(e => new EventoDetalleDto
                            {
                                EventoId = e.EventoId,
                                EstadoCodigo = new EstadosDTO
                                {
                                    Codigo = e.EstadoCodigoNavigation.Codigo,
                                    DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                                    DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                                    Color = e.EstadoCodigoNavigation.Color
                                },
                                FechaRegistro = e.Fecha,
                                FechaSolicitud = null,
                                TipoEventoId = new TipoEventoDto()
                                {
                                    TipoEventoId = e.TipoEventoId,
                                    Nombre = e.TipoEvento.Nombre,
                                    TablaEvento = e.TipoEvento.TablaEvento
                                }
                            }).FirstOrDefaultAsync();
                        if (evento1Detalle != null) eventosDetalles.Add(evento1Detalle);
                        break;
                    case "evento2":
                        var evento2Detalle = await _context.Evento2s
                            .Where(e => e.EventoId == conexionEvento.IdEvento)
                            .Include(e => e.TipoEvento)
                            .Include(e => e.EstadoCodigoNavigation)
                            .Select(e => new EventoDetalleDto
                            {
                                EventoId = e.EventoId,
                                EstadoCodigo = new EstadosDTO
                                {
                                    Codigo = e.EstadoCodigoNavigation.Codigo,
                                    DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                                    DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                                    Color = e.EstadoCodigoNavigation.Color
                                },
                                FechaRegistro = e.FechaRegistro,
                                FechaSolicitud = null,
                                TipoEventoId = new TipoEventoDto()
                                {
                                    TipoEventoId = e.TipoEventoId,
                                    Nombre = e.TipoEvento.Nombre,
                                    TablaEvento = e.TipoEvento.TablaEvento
                                }
                            }).FirstOrDefaultAsync();
                        if (evento2Detalle != null) eventosDetalles.Add(evento2Detalle);
                        break;
                    case "evento3":
                        var evento3Detalle = await _context.Evento3s
                            .Where(e => e.EventoId == conexionEvento.IdEvento)
                            .Include(e => e.TipoEvento)
                            .Include(e => e.EstadoCodigoNavigation)
                            .Select(e => new EventoDetalleDto
                            {
                                EventoId = e.EventoId,
                                EstadoCodigo = new EstadosDTO
                                {
                                    Codigo = e.EstadoCodigoNavigation.Codigo,
                                    DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                                    DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                                    Color = e.EstadoCodigoNavigation.Color
                                },
                                FechaRegistro = e.FechaRegistro,
                                FechaSolicitud = e.FechaSolicitud,
                                TipoEventoId = new TipoEventoDto()
                                {
                                    TipoEventoId = e.TipoEventoId,
                                    Nombre = e.TipoEvento.Nombre,
                                    TablaEvento = e.TipoEvento.TablaEvento
                                }
                            }).FirstOrDefaultAsync();
                        if (evento3Detalle != null) eventosDetalles.Add(evento3Detalle);
                        break;
                    case "evento4":
                        var evento4Detalle = await _context.Evento4s
                            .Where(e => e.EventoId == conexionEvento.IdEvento)
                            .Include(e => e.TipoEvento)
                            .Include(e => e.EstadoCodigoNavigation)
                            .Select(e => new EventoDetalleDto
                            {
                                EventoId = e.EventoId,
                                EstadoCodigo = new EstadosDTO
                                {
                                    Codigo = e.EstadoCodigoNavigation.Codigo,
                                    DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                                    DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                                    Color = e.EstadoCodigoNavigation.Color
                                },
                                FechaRegistro = e.FechaRegistro,
                                FechaSolicitud = e.FechaSolicitud,
                                TipoEventoId = new TipoEventoDto()
                                {
                                    TipoEventoId = e.TipoEventoId,
                                    Nombre = e.TipoEvento.Nombre,
                                    TablaEvento = e.TipoEvento.TablaEvento
                                }
                            }).FirstOrDefaultAsync();
                        if (evento4Detalle != null) eventosDetalles.Add(evento4Detalle);
                        break;
                }
            }

            if (!eventosDetalles.Any())
            {
                return NotFound("Detalles de eventos no encontrados para las conexiones dadas.");
            }

            return eventosDetalles;
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteEventoYConexion(string tablaEvento, int idEvento)
        {
            // Eliminar el evento de la tabla correspondiente
            switch (tablaEvento.ToLower())
            {
                case "evento1":
                    var evento1 = await _context.Evento1s.FindAsync(idEvento);
                    if (evento1 != null)
                    {
                        _context.Evento1s.Remove(evento1);
                        await _context.SaveChangesAsync();
                    }
                    break;
                case "evento2":
                    var evento2 = await _context.Evento2s.FindAsync(idEvento);
                    if (evento2 != null)
                    {
                        _context.Evento2s.Remove(evento2);
                        await _context.SaveChangesAsync();
                    }
                    break;
                case "evento3":
                    var evento3 = await _context.Evento3s.FindAsync(idEvento);
                    if (evento3 != null)
                    {
                        _context.Evento3s.Remove(evento3);
                        await _context.SaveChangesAsync();
                    }
                    break;
                case "evento4":
                    var evento4 = await _context.Evento4s
                        .Include(e => e.GrupoUnoEvento4s)
                        .Include(e => e.GrupoDosEvento4s)
                        .FirstOrDefaultAsync(e => e.EventoId == idEvento);

                    if (evento4 != null)
                    {
                        // Primero eliminar los grupos asociados
                        _context.GrupoUnoEvento4s.RemoveRange(evento4.GrupoUnoEvento4s);
                        _context.GrupoDosEvento4s.RemoveRange(evento4.GrupoDosEvento4s);

                        // Luego eliminar el evento4
                        _context.Evento4s.Remove(evento4);
                        await _context.SaveChangesAsync();
                    }
                    break;
                default:
                    return BadRequest("Nombre de tabla desconocido.");
            }

            // Eliminar la conexión asociada
            var conexionEvento = await _context.ConexionEventos
                .FirstOrDefaultAsync(ce => ce.TablaConexionEvento == tablaEvento && ce.IdEvento == idEvento);
            if (conexionEvento != null)
            {
                _context.ConexionEventos.Remove(conexionEvento);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }



        private bool ConexionEventoExists(int id)
        {
            return (_context.ConexionEventos?.Any(e => e.ConexionEventoId == id)).GetValueOrDefault();
        }
    }
}
