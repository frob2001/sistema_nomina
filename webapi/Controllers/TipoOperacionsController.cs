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
    [Route("TipoOperacion")]
    [ApiController]
    public class TipoOperacionesController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public TipoOperacionesController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/TipoOperaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoOperacionDTO>>> GetTipoOperaciones()
        {
            if (_context.TipoOperacions == null)
            {
                return NotFound();
            }

            var tipoOperaciones = await _context.TipoOperacions
                .Select(to => new TipoOperacionDTO { TipoOperacionId = to.TipoOperacionId, Nombre = to.Nombre })
                .ToListAsync();

            return tipoOperaciones;
        }

        // GET: api/TipoOperaciones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoOperacionDTO>> GetTipoOperacion(int id)
        {
            if (_context.TipoOperacions == null)
            {
                return NotFound();
            }

            var tipoOperacion = await _context.TipoOperacions
                .Where(to => to.TipoOperacionId == id)
                .Select(to => new TipoOperacionDTO { TipoOperacionId = to.TipoOperacionId, Nombre = to.Nombre })
                .FirstOrDefaultAsync();

            if (tipoOperacion == null)
            {
                return NotFound();
            }

            return tipoOperacion;
        }

        public class TipoOperacionInputDTO
        {
            public int TipoOperacionId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/TipoOperaciones/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoOperacion(int id, TipoOperacionInputDTO tipoOperacionDTO)
        {

            var tipoOperacion = await _context.TipoOperacions.FindAsync(id);
            if (tipoOperacion == null)
            {
                return NotFound();
            }

            tipoOperacion.Nombre = tipoOperacionDTO.Nombre;

            _context.Entry(tipoOperacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoOperacionExists(id))
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

        // POST: api/TipoOperaciones
        [HttpPost]
        public async Task<ActionResult<TipoOperacionDTO>> PostTipoOperacion(TipoOperacionInputDTO tipoOperacionDTO)
        {
            if (_context.TipoOperacions == null)
            {
                return Problem("Entity set 'SistemaNominaContext.TipoOperaciones' is null.");
            }

            var tipoOperacion = new TipoOperacion { Nombre = tipoOperacionDTO.Nombre };

            _context.TipoOperacions.Add(tipoOperacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoOperacion", new { id = tipoOperacion.TipoOperacionId }, new TipoOperacionDTO { TipoOperacionId = tipoOperacion.TipoOperacionId, Nombre = tipoOperacion.Nombre });
        }

        // DELETE: api/TipoOperaciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoOperacion(int id)
        {
            if (_context.TipoOperacions == null)
            {
                return NotFound();
            }
            var tipoOperacion = await _context.TipoOperacions.FindAsync(id);
            if (tipoOperacion == null)
            {
                return NotFound();
            }

            _context.TipoOperacions.Remove(tipoOperacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoOperacionExists(int id)
        {
            return (_context.TipoOperacions?.Any(e => e.TipoOperacionId == id)).GetValueOrDefault();
        }
    }
}
