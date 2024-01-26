using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.Evento2Controller;

namespace webapi.Controllers
{
    [Route("EventoTres")]
    [ApiController]
    public class Evento3Controller : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public Evento3Controller(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class Evento3Dto
        {
            public int EventoId { get; set; }
            public EstadosDTO EstadoCodigo { get; set; }
            public TipoEventoDto TipoEvento { get; set; }
            public DateTime? FechaVigenciaDesde { get; set; }
            public DateTime? FechaVigenciaHasta { get; set; }
            public string? Solicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public DateTime? FechaRegistro { get; set; }
        }


        // GET: api/Evento3/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Evento3Dto>> GetEvento3(int id)
        {
            if (_context.Evento3s == null)
            {
                return NotFound();
            }
            var evento3 = await _context.Evento3s
                .Include(e => e.EstadoCodigoNavigation)
                .Include(e => e.TipoEvento)
                .Where(e => e.EventoId == id)
                .Select(e => new Evento3Dto
                {
                    EventoId = e.EventoId,
                    EstadoCodigo = new EstadosDTO
                    {
                        Codigo = e.EstadoCodigoNavigation.Codigo,
                        DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                        DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                        Color = e.EstadoCodigoNavigation.Color
                    },
                    TipoEvento = new TipoEventoDto
                    {
                        TipoEventoId = e.TipoEvento.TipoEventoId,
                        Nombre = e.TipoEvento.Nombre,
                        TablaEvento = e.TipoEvento.TablaEvento
                    },
                    FechaVigenciaDesde = e.FechaVigenciaDesde,
                    FechaVigenciaHasta = e.FechaVigenciaHasta,
                    Solicitud = e.Solicitud,
                    Registro = e.Registro,
                    FechaSolicitud = e.FechaSolicitud,
                    FechaRegistro = e.FechaRegistro
                })
                .FirstOrDefaultAsync();

            if (evento3 == null)
            {
                return NotFound();
            }

            return evento3;
        }

        public class Evento3CreateDto
        {
            public string EstadoCodigo { get; set; }
            public DateTime? FechaVigenciaDesde { get; set; }
            public DateTime? FechaVigenciaHasta { get; set; }
            public string? Solicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string TablaConexion { get; set; }
            public int IdConexion { get; set; }
        }



        [HttpPost]
        public async Task<ActionResult<Evento3>> PostEvento3(Evento3CreateDto evento3CreateDto)
        {
            if (_context.Evento3s == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Evento3s' is null.");
            }

            var evento3 = new Evento3
            {
                TipoEventoId = 5,
                EstadoCodigo = evento3CreateDto.EstadoCodigo,
                FechaVigenciaDesde = evento3CreateDto.FechaVigenciaDesde,
                FechaVigenciaHasta = evento3CreateDto.FechaVigenciaHasta,
                Solicitud = evento3CreateDto.Solicitud,
                Registro = evento3CreateDto.Registro,
                FechaSolicitud = evento3CreateDto.FechaSolicitud,
                FechaRegistro = evento3CreateDto.FechaRegistro
            };

            _context.Evento3s.Add(evento3);
            await _context.SaveChangesAsync();

            // Crear y guardar ConexionEvento
            var conexionEvento = new ConexionEvento
            {
                TablaConexion = evento3CreateDto.TablaConexion,
                IdConexion = evento3CreateDto.IdConexion,
                TablaConexionEvento = "evento3",
                IdEvento = evento3.EventoId
            };

            switch (evento3CreateDto.TablaConexion.ToLower())
            {
                case "marca":
                    await ActualizarEstadoMarca(evento3CreateDto.IdConexion, evento3CreateDto.EstadoCodigo);
                    break;
                case "patente":
                    await ActualizarEstadoPatente(evento3CreateDto.IdConexion, evento3CreateDto.EstadoCodigo);
                    break;
                case "acciontercero":
                    await ActualizarEstadoAccion(evento3CreateDto.IdConexion, evento3CreateDto.EstadoCodigo);
                    break;
                default:
                    return BadRequest("El nombre de la tabla no existe");
            }


            _context.ConexionEventos.Add(conexionEvento);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvento3", new { id = evento3.EventoId }, evento3);
        }



        private async Task<IActionResult> ActualizarEstadoMarca(int marcaId, string estadoId)
        {
            var marca = await _context.Marcas.Include(m => m.EstadoMarcas).FirstOrDefaultAsync(m => m.MarcaId == marcaId);
            if (marca == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (marca.EstadoMarcas.Any(em => em.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoMarca = new EstadoMarca
            {
                MarcaId = marcaId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            marca.EstadoMarcas.Add(nuevoEstadoMarca);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private async Task<IActionResult> ActualizarEstadoPatente(int patenteId, string estadoId)
        {
            var patente = await _context.Patentes.Include(p => p.EstadoPatentes).FirstOrDefaultAsync(p => p.PatenteId == patenteId);
            if (patente == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (patente.EstadoPatentes.Any(ep => ep.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoPatente = new EstadoPatente
            {
                PatenteId = patenteId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            patente.EstadoPatentes.Add(nuevoEstadoPatente);
            await _context.SaveChangesAsync();

            return Ok();
        }


        private async Task<IActionResult> ActualizarEstadoAccion(int accionTerceroId, string estadoId)
        {
            var accion = await _context.AccionTerceros.Include(a => a.EstadoAcciones).FirstOrDefaultAsync(a => a.AccionTerceroId == accionTerceroId);
            if (accion == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (accion.EstadoAcciones.Any(ea => ea.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoAccion = new EstadoAccion
            {
                AccionTerceroId = accionTerceroId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            accion.EstadoAcciones.Add(nuevoEstadoAccion);
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
