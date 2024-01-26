using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TipoAcciones")]
    [ApiController]
    public class TipoAccionsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoAccionsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoAccions()
        {
            if (_context.TipoAccions == null)
            {
                return NotFound();
            }

            var result = await _context.TipoAccions
                .Select(ta => new { ta.TipoAccionId, ta.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoAccion(int id)
        {
            if (_context.TipoAccions == null)
            {
                return NotFound();
            }

            var tipoAccion = await _context.TipoAccions
                .Where(ta => ta.TipoAccionId == id)
                .Select(ta => new { ta.TipoAccionId, ta.Nombre })
                .FirstOrDefaultAsync();

            if (tipoAccion == null)
            {
                return NotFound();
            }

            return Ok(tipoAccion);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoAccion(int id, TipoAccion tipoAccion)
        {
            if (id != tipoAccion.TipoAccionId)
            {
                return BadRequest();
            }

            _context.Entry(tipoAccion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoAccionExists(id))
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

        public class TipoAccionDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoAccion>> PostTipoAccion(TipoAccionDTO tipoAccionDTO)
        {
            if (_context.TipoAccions == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoAccions' is null.");
            }

            var tipoAccion = new TipoAccion
            {
                Nombre = tipoAccionDTO.Nombre
            };

            _context.TipoAccions.Add(tipoAccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoAccion", new { id = tipoAccion.TipoAccionId }, tipoAccion);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoAccion(int id)
        {
            if (_context.TipoAccions == null)
            {
                return NotFound();
            }
            var tipoAccion = await _context.TipoAccions.FindAsync(id);
            if (tipoAccion == null)
            {
                return NotFound();
            }

            _context.TipoAccions.Remove(tipoAccion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoAccionExists(int id)
        {
            return (_context.TipoAccions?.Any(e => e.TipoAccionId == id)).GetValueOrDefault();
        }
    }
}
