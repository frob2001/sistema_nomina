using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.Evento1Controller;

namespace webapi.Controllers
{
    [Route("EventoDos")]
    [ApiController]
    public class Evento2Controller : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public Evento2Controller(KattionDataBaseContext context)
        {
            _context = context;
        }
        public class Evento2Dto
        {
            public int EventoId { get; set; }
            public EstadosDTO EstadoCodigo { get; set; }
            public TipoEventoDto TipoEvento { get; set; }
            public string? Propietario { get; set; }
            public string? Agente { get; set; }
            public string? MarcaOpuesta { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public int? ClaseId { get; set; }
        }

        // GET: api/Evento2/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Evento2Dto>> GetEvento2(int id)
        {
            if (_context.Evento2s == null)
            {
                return NotFound();
            }

            // Incluye los objetos relacionados y selecciona solo los campos necesarios
            var evento2 = await _context.Evento2s
                .Include(e => e.EstadoCodigoNavigation)
                .Include(e => e.TipoEvento)
                .Include(e => e.Clase)
                .Where(e => e.EventoId == id)
                .Select(e => new Evento2Dto
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
                    Propietario = e.Propietario,
                    Agente = e.Agente,
                    MarcaOpuesta = e.MarcaOpuesta,
                    Registro = e.Registro,
                    FechaRegistro = e.FechaRegistro,
                    ClaseId = e.ClaseId
                })
                .FirstOrDefaultAsync();

            if (evento2 == null)
            {
                return NotFound();
            }

            return evento2;
        }


        public class Evento2CreateDto
        {
            public int TipoEventoId { get; set; }
            public string EstadoCodigo { get; set; }
            public string? Propietario { get; set; }
            public string? Agente { get; set; }
            public string? MarcaOpuesta { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public int? ClaseId { get; set; }
            public string TablaConexion { get; set; }
            public int IdConexion { get; set; }
        }


        // POST: api/Evento2
        [HttpPost]
        public async Task<ActionResult<Evento2>> PostEvento2(Evento2CreateDto evento2CreateDto)
        {
            if (_context.Evento2s == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Evento2s' is null.");
            }

            var evento2 = new Evento2
            {
                TipoEventoId = evento2CreateDto.TipoEventoId,
                EstadoCodigo = evento2CreateDto.EstadoCodigo,
                Propietario = evento2CreateDto.Propietario,
                Agente = evento2CreateDto.Agente,
                MarcaOpuesta = evento2CreateDto.MarcaOpuesta,
                Registro = evento2CreateDto.Registro,
                FechaRegistro = evento2CreateDto.FechaRegistro,
                ClaseId = evento2CreateDto.ClaseId,
            };

            _context.Evento2s.Add(evento2);
            await _context.SaveChangesAsync();

            // Crear y guardar ConexionEvento
            var conexionEvento = new ConexionEvento
            {
                TablaConexion = evento2CreateDto.TablaConexion,
                IdConexion = evento2CreateDto.IdConexion,
                TablaConexionEvento = "evento2",
                IdEvento = evento2.EventoId
            };

            switch (evento2CreateDto.TablaConexion.ToLower())
            {
                case "marca":
                    await ActualizarEstadoMarca(evento2CreateDto.IdConexion, evento2CreateDto.EstadoCodigo);
                    break;
                case "patente":
                    await ActualizarEstadoPatente(evento2CreateDto.IdConexion, evento2CreateDto.EstadoCodigo);
                    break;
                case "acciontercero":
                    await ActualizarEstadoAccion(evento2CreateDto.IdConexion, evento2CreateDto.EstadoCodigo);
                    break;
                default:
                    return BadRequest("El nombre de la tabla no existe");
            }

            _context.ConexionEventos.Add(conexionEvento);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvento2", new { id = evento2.EventoId }, evento2);
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
