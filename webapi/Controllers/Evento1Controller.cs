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
    [Route("EventoUno")]
    [ApiController]
    public class Evento1Controller : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public Evento1Controller(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class Evento1Dto
        {
            public int EventoId { get; set; }
            public EstadosDTO EstadoCodigo { get; set; }
            public TipoEventoDto TipoEvento { get; set; }
            public DateTime? Fecha { get; set; }
        }

        // GET: api/Evento1/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Evento1Dto>> GetEvento1(int id)
        {
            if (_context.Evento1s == null)
            {
                return NotFound();
            }

            // Incluye los objetos relacionados y selecciona solo los campos necesarios
            var evento1 = await _context.Evento1s
                .Include(e => e.EstadoCodigoNavigation)
                .Include(e => e.TipoEvento)
                .Where(e => e.EventoId == id)
                .Select(e => new Evento1Dto
                {
                    EventoId = e.EventoId,
                    EstadoCodigo = new EstadosDTO
                    {
                        Codigo = e.EstadoCodigoNavigation.Codigo,
                        DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                        DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                        Color = e.EstadoCodigoNavigation.Color
                    },
                    TipoEvento = new TipoEventoDto{
                        TipoEventoId = e.TipoEvento.TipoEventoId,
                        Nombre = e.TipoEvento.Nombre,
                        TablaEvento = e.TipoEvento.TablaEvento
                    },
                    Fecha = e.Fecha
                })
                .FirstOrDefaultAsync();

            if (evento1 == null)
            {
                return NotFound();
            }

            return evento1;
        }


        public class Evento1CreateDto
        {
            public string EstadoCodigo { get; set; }
            public DateTime? Fecha { get; set; }
            public string TablaConexion { get; set; }
            public int IdConexion { get; set; }
        }

        // POST: api/Evento1
        [HttpPost]
        public async Task<ActionResult<Evento1>> PostEvento1(Evento1CreateDto evento1CreateDto)
        {
            if (_context.Evento1s == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Evento1s' is null.");
            }

            var evento1 = new Evento1
            {
                TipoEventoId = 1,
                EstadoCodigo = evento1CreateDto.EstadoCodigo,
                Fecha = evento1CreateDto.Fecha
            };

            _context.Evento1s.Add(evento1);
            await _context.SaveChangesAsync();

            // Crear y guardar ConexionEvento
            var conexionEvento = new ConexionEvento
            {
                TablaConexion = evento1CreateDto.TablaConexion,
                IdConexion = evento1CreateDto.IdConexion,
                TablaConexionEvento = "evento1",
                IdEvento = evento1.EventoId
            };

            switch (evento1CreateDto.TablaConexion.ToLower())
            {
                case "marca":
                    await ActualizarEstadoMarca(evento1CreateDto.IdConexion, evento1CreateDto.EstadoCodigo);
                    break;
                case "patente":
                    await ActualizarEstadoPatente(evento1CreateDto.IdConexion, evento1CreateDto.EstadoCodigo);
                    break;
                case "acciontercero":
                    await ActualizarEstadoAccion(evento1CreateDto.IdConexion, evento1CreateDto.EstadoCodigo);
                    break;
                default:
                    return BadRequest("El nombre de la tabla no existe");
            }

            _context.ConexionEventos.Add(conexionEvento);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvento1", new { id = evento1.EventoId }, evento1);
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
