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
    [Route("Emisor")]
    [ApiController]
    public class EmisorsController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public EmisorsController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/Emisors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmisorDTO>>> GetEmisors()
        {
            if (_context.Emisors == null)
            {
                return NotFound();
            }

            var emisores = await _context.Emisors
                .Select(e => new EmisorDTO { EmisorId = e.EmisorId, Nombre = e.Nombre })
                .ToListAsync();

            return emisores;
        }

        // GET: api/Emisors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmisorDTO>> GetEmisor(int id)
        {
            if (_context.Emisors == null)
            {
                return NotFound();
            }

            var emisor = await _context.Emisors
                .Where(e => e.EmisorId == id)
                .Select(e => new EmisorDTO { EmisorId = e.EmisorId, Nombre = e.Nombre })
                .FirstOrDefaultAsync();

            if (emisor == null)
            {
                return NotFound();
            }

            return emisor;
        }


        public class EmisorInputDTO
        {
            public int EmisorId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Emisors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmisor(int id, EmisorInputDTO emisorDTO)
        {

            var emisor = await _context.Emisors.FindAsync(id);
            if (emisor == null)
            {
                return NotFound();
            }

            emisor.Nombre = emisorDTO.Nombre;

            _context.Entry(emisor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmisorExists(id))
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


        // POST: api/Emisors
        [HttpPost]
        public async Task<ActionResult<EmisorDTO>> PostEmisor(EmisorInputDTO emisorDTO)
        {
            if (_context.Emisors == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Emisors' is null.");
            }

            var emisor = new Emisor { Nombre = emisorDTO.Nombre };

            _context.Emisors.Add(emisor);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmisor", new { id = emisor.EmisorId }, new EmisorDTO { EmisorId = emisor.EmisorId, Nombre = emisor.Nombre });
        }


        // DELETE: api/Emisors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmisor(int id)
        {
            if (_context.Emisors == null)
            {
                return NotFound();
            }
            var emisor = await _context.Emisors.FindAsync(id);
            if (emisor == null)
            {
                return NotFound();
            }

            _context.Emisors.Remove(emisor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmisorExists(int id)
        {
            return (_context.Emisors?.Any(e => e.EmisorId == id)).GetValueOrDefault();
        }
    }
}
