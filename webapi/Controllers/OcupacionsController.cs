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
    [Route("Ocupacion")]
    [ApiController]
    public class OcupacionesController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public OcupacionesController(SistemaNominaContext context)
        {
            _context = context;
        }

        public class OcupacionDTO
        {
            public int OcupacionId { get; set; }
            public string? Nombre { get; set; }
        }

        // GET: api/Ocupaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OcupacionDTO>>> GetOcupaciones()
        {
            if (_context.Ocupacions == null)
            {
                return NotFound();
            }

            var ocupaciones = await _context.Ocupacions
                .Select(o => new OcupacionDTO { OcupacionId = o.OcupacionId, Nombre = o.Nombre })
                .ToListAsync();

            return ocupaciones;
        }

        // GET: api/Ocupaciones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OcupacionDTO>> GetOcupacion(int id)
        {
            if (_context.Ocupacions == null)
            {
                return NotFound();
            }

            var ocupacion = await _context.Ocupacions
                .Where(o => o.OcupacionId == id)
                .Select(o => new OcupacionDTO { OcupacionId = o.OcupacionId, Nombre = o.Nombre })
                .FirstOrDefaultAsync();

            if (ocupacion == null)
            {
                return NotFound();
            }

            return ocupacion;
        }

        public class OcupacionInputDTO
        {
            public int OcupacionId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Ocupaciones/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOcupacion(int id, OcupacionInputDTO ocupacionDTO)
        {

            var ocupacion = await _context.Ocupacions.FindAsync(id);
            if (ocupacion == null)
            {
                return NotFound();
            }

            ocupacion.Nombre = ocupacionDTO.Nombre;

            _context.Entry(ocupacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OcupacionExists(id))
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

        // POST: api/Ocupaciones
        [HttpPost]
        public async Task<ActionResult<OcupacionDTO>> PostOcupacion(OcupacionInputDTO ocupacionDTO)
        {
            if (_context.Ocupacions == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Ocupaciones' is null.");
            }

            var ocupacion = new Ocupacion { Nombre = ocupacionDTO.Nombre };

            _context.Ocupacions.Add(ocupacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOcupacion", new { id = ocupacion.OcupacionId }, new OcupacionDTO { OcupacionId = ocupacion.OcupacionId, Nombre = ocupacion.Nombre });
        }

        // DELETE: api/Ocupaciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOcupacion(int id)
        {
            if (_context.Ocupacions == null)
            {
                return NotFound();
            }
            var ocupacion = await _context.Ocupacions.FindAsync(id);
            if (ocupacion == null)
            {
                return NotFound();
            }

            _context.Ocupacions.Remove(ocupacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OcupacionExists(int id)
        {
            return (_context.Ocupacions?.Any(e => e.OcupacionId == id)).GetValueOrDefault();
        }
    }
}
