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
    [Route("TipoComision")]
    [ApiController]
    public class TipoComisionsController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public TipoComisionsController(SistemaNominaContext context)
        {
            _context = context;
        }

        public class TipoComisionDTO
        {
            public int TipoComisionId { get; set; }
            public string? Nombre { get; set; }
        }

        // GET: api/TipoComisions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoComisionDTO>>> GetTipoComisions()
        {
            if (_context.TipoComisions == null)
            {
                return NotFound();
            }

            var tipoComisions = await _context.TipoComisions
                .Select(tc => new TipoComisionDTO { TipoComisionId = tc.TipoComisionId, Nombre = tc.Nombre })
                .ToListAsync();

            return tipoComisions;
        }

        // GET: api/TipoComisions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoComisionDTO>> GetTipoComision(int id)
        {
            if (_context.TipoComisions == null)
            {
                return NotFound();
            }

            var tipoComision = await _context.TipoComisions
                .Where(tc => tc.TipoComisionId == id)
                .Select(tc => new TipoComisionDTO { TipoComisionId = tc.TipoComisionId, Nombre = tc.Nombre })
                .FirstOrDefaultAsync();

            if (tipoComision == null)
            {
                return NotFound();
            }

            return tipoComision;
        }

        public class TipoComisionInputDTO
        {
            public int TipoComisionId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/TipoComisions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoComision(int id, TipoComisionInputDTO tipoComisionDTO)
        {

            var tipoComision = await _context.TipoComisions.FindAsync(id);
            if (tipoComision == null)
            {
                return NotFound();
            }

            tipoComision.Nombre = tipoComisionDTO.Nombre;

            _context.Entry(tipoComision).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoComisionExists(id))
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

        // POST: api/TipoComisions
        [HttpPost]
        public async Task<ActionResult<TipoComisionDTO>> PostTipoComision(TipoComisionInputDTO tipoComisionDTO)
        {
            if (_context.TipoComisions == null)
            {
                return Problem("Entity set 'SistemaNominaContext.TipoComisions' is null.");
            }

            var tipoComision = new TipoComision { Nombre = tipoComisionDTO.Nombre };

            _context.TipoComisions.Add(tipoComision);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoComision", new { id = tipoComision.TipoComisionId }, new TipoComisionDTO { TipoComisionId = tipoComision.TipoComisionId, Nombre = tipoComision.Nombre });
        }

        // DELETE: api/TipoComisions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoComision(int id)
        {
            if (_context.TipoComisions == null)
            {
                return NotFound();
            }
            var tipoComision = await _context.TipoComisions.FindAsync(id);
            if (tipoComision == null)
            {
                return NotFound();
            }

            _context.TipoComisions.Remove(tipoComision);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoComisionExists(int id)
        {
            return (_context.TipoComisions?.Any(e => e.TipoComisionId == id)).GetValueOrDefault();
        }
    }
}
