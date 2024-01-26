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
    [Route("NivelSalarial")]
    [ApiController]
    public class NivelSalarialsController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public NivelSalarialsController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/NivelSalarials
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NivelSalarialDTO>>> GetNivelSalarials()
        {
            if (_context.NivelSalarials == null)
            {
                return NotFound();
            }

            var nivelSalarials = await _context.NivelSalarials
                .Select(ns => new NivelSalarialDTO { NivelSalarialId = ns.NivelSalarialId, Nombre = ns.Nombre })
                .ToListAsync();

            return nivelSalarials;
        }

        // GET: api/NivelSalarials/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NivelSalarialDTO>> GetNivelSalarial(int id)
        {
            if (_context.NivelSalarials == null)
            {
                return NotFound();
            }

            var nivelSalarial = await _context.NivelSalarials
                .Where(ns => ns.NivelSalarialId == id)
                .Select(ns => new NivelSalarialDTO { NivelSalarialId = ns.NivelSalarialId, Nombre = ns.Nombre })
                .FirstOrDefaultAsync();

            if (nivelSalarial == null)
            {
                return NotFound();
            }

            return nivelSalarial;
        }

        public class NivelSalarialInputDTO
        {
            public int NivelSalarialId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/NivelSalarials/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNivelSalarial(int id, NivelSalarialInputDTO nivelSalarialDTO)
        {

            var nivelSalarial = await _context.NivelSalarials.FindAsync(id);
            if (nivelSalarial == null)
            {
                return NotFound();
            }

            nivelSalarial.Nombre = nivelSalarialDTO.Nombre;

            _context.Entry(nivelSalarial).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NivelSalarialExists(id))
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

        // POST: api/NivelSalarials
        [HttpPost]
        public async Task<ActionResult<NivelSalarialDTO>> PostNivelSalarial(NivelSalarialInputDTO nivelSalarialDTO)
        {
            if (_context.NivelSalarials == null)
            {
                return Problem("Entity set 'SistemaNominaContext.NivelSalarials' is null.");
            }

            var nivelSalarial = new NivelSalarial { Nombre = nivelSalarialDTO.Nombre };

            _context.NivelSalarials.Add(nivelSalarial);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNivelSalarial", new { id = nivelSalarial.NivelSalarialId }, new NivelSalarialDTO { NivelSalarialId = nivelSalarial.NivelSalarialId, Nombre = nivelSalarial.Nombre });
        }

        // DELETE: api/NivelSalarials/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNivelSalarial(int id)
        {
            if (_context.NivelSalarials == null)
            {
                return NotFound();
            }
            var nivelSalarial = await _context.NivelSalarials.FindAsync(id);
            if (nivelSalarial == null)
            {
                return NotFound();
            }

            _context.NivelSalarials.Remove(nivelSalarial);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NivelSalarialExists(int id)
        {
            return (_context.NivelSalarials?.Any(e => e.NivelSalarialId == id)).GetValueOrDefault();
        }
    }
}
