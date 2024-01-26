using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TiposEstados")]
    [ApiController]
    public class TipoEstadoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoEstadoesController(KattionDataBaseContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoEstadoDTO>>> GetTipoEstados()
        {
            if (_context.TipoEstados == null)
            {
                return NotFound();
            }
            return await _context.TipoEstados
                .Select(t => new TipoEstadoDTO
                {
                    TipoEstadoId = t.TipoEstadoId,
                    NombreEspanol = t.NombreEspanol,
                    NombreIngles = t.NombreIngles,
                    DisplayName = t.TipoEstadoId + ": "+ t.NombreEspanol + " / " + t.NombreIngles

                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoEstadoDTO>> GetTipoEstado(string id)
        {
            if (_context.TipoEstados == null)
            {
                return NotFound();
            }
            var tipoEstado = await _context.TipoEstados
                .Select(t => new TipoEstadoDTO
                {
                    TipoEstadoId = t.TipoEstadoId,
                    NombreEspanol = t.NombreEspanol,
                    NombreIngles = t.NombreIngles,
                    DisplayName = t.TipoEstadoId + ": " + t.NombreEspanol + " / " + t.NombreIngles
                })
                .FirstOrDefaultAsync(t => t.TipoEstadoId == id);

            if (tipoEstado == null)
            {
                return NotFound();
            }

            return tipoEstado;
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoEstado(string id, TipoEstado tipoEstado)
        {
            if (id != tipoEstado.TipoEstadoId)
            {
                return BadRequest();
            }

            _context.Entry(tipoEstado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoEstadoExists(id))
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


        [HttpPost]
        public async Task<ActionResult<TipoEstado>> PostTipoEstado(TipoEstadoDTO tipoEstadoDTO)
        {
            if (_context.TipoEstados == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoEstados'  is null.");
            }

            var tipoEstado = new TipoEstado
            {
                TipoEstadoId = tipoEstadoDTO.TipoEstadoId,
                NombreEspanol = tipoEstadoDTO.NombreEspanol,
                NombreIngles = tipoEstadoDTO.NombreIngles
            };

            _context.TipoEstados.Add(tipoEstado);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TipoEstadoExists(tipoEstado.TipoEstadoId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTipoEstado", new { id = tipoEstado.TipoEstadoId }, tipoEstadoDTO);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoEstado(string id)
        {
            if (_context.TipoEstados == null)
            {
                return NotFound();
            }
            var tipoEstado = await _context.TipoEstados.FindAsync(id);
            if (tipoEstado == null)
            {
                return NotFound();
            }

            _context.TipoEstados.Remove(tipoEstado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoEstadoExists(string id)
        {
            return (_context.TipoEstados?.Any(e => e.TipoEstadoId == id)).GetValueOrDefault();
        }
    }
}
