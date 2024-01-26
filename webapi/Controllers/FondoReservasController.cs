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
    [Route("FondoReserva")]
    [ApiController]
    public class FondoReservasController : ControllerBase
    {
        private readonly SistemanominaContext _context;

        public FondoReservasController(SistemanominaContext context)
        {
            _context = context;
        }

        // GET: api/FondoReservas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FondoReservaDTO>>> GetFondoReservas()
        {
            if (_context.FondoReservas == null)
            {
                return NotFound();
            }

            var fondoReservas = await _context.FondoReservas
                .Select(fr => new FondoReservaDTO { FondoReservaId = fr.FondoReservaId, Nombre = fr.Nombre })
                .ToListAsync();

            return fondoReservas;
        }

        // GET: api/FondoReservas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FondoReservaDTO>> GetFondoReserva(int id)
        {
            if (_context.FondoReservas == null)
            {
                return NotFound();
            }

            var fondoReserva = await _context.FondoReservas
                .Where(fr => fr.FondoReservaId == id)
                .Select(fr => new FondoReservaDTO { FondoReservaId = fr.FondoReservaId, Nombre = fr.Nombre })
                .FirstOrDefaultAsync();

            if (fondoReserva == null)
            {
                return NotFound();
            }

            return fondoReserva;
        }

        public class FondoReservaInputDTO
        {
            public int FondoReservaId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/FondoReservas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFondoReserva(int id, FondoReservaInputDTO fondoReservaDTO)
        {

            var fondoReserva = await _context.FondoReservas.FindAsync(id);
            if (fondoReserva == null)
            {
                return NotFound();
            }

            fondoReserva.Nombre = fondoReservaDTO.Nombre;

            _context.Entry(fondoReserva).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FondoReservaExists(id))
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

        // POST: api/FondoReservas
        [HttpPost]
        public async Task<ActionResult<FondoReservaDTO>> PostFondoReserva(FondoReservaInputDTO fondoReservaDTO)
        {
            if (_context.FondoReservas == null)
            {
                return Problem("Entity set 'SistemaNominaContext.FondoReservas' is null.");
            }

            var fondoReserva = new FondoReserva { Nombre = fondoReservaDTO.Nombre };

            _context.FondoReservas.Add(fondoReserva);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFondoReserva", new { id = fondoReserva.FondoReservaId }, new FondoReservaDTO { FondoReservaId = fondoReserva.FondoReservaId, Nombre = fondoReserva.Nombre });
        }

        // DELETE: api/FondoReservas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFondoReserva(int id)
        {
            if (_context.FondoReservas == null)
            {
                return NotFound();
            }
            var fondoReserva = await _context.FondoReservas.FindAsync(id);
            if (fondoReserva == null)
            {
                return NotFound();
            }

            _context.FondoReservas.Remove(fondoReserva);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FondoReservaExists(int id)
        {
            return (_context.FondoReservas?.Any(e => e.FondoReservaId == id)).GetValueOrDefault();
        }
    }
}
