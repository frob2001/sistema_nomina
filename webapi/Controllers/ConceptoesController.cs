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
    [Route("Concepto")]
    [ApiController]
    public class ConceptosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public ConceptosController(SistemaNominaContext context)
        {
            _context = context;
        }

        public class ConceptoDTO
        {
            public int ConceptoId { get; set; }
            public string? Nombre { get; set; }
        }

        // GET: api/Conceptos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConceptoDTO>>> GetConceptos()
        {
            if (_context.Conceptos == null)
            {
                return NotFound();
            }

            var conceptos = await _context.Conceptos
                .Select(c => new ConceptoDTO { ConceptoId = c.ConceptoId, Nombre = c.Nombre })
                .ToListAsync();

            return conceptos;
        }

        // GET: api/Conceptos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConceptoDTO>> GetConcepto(int id)
        {
            if (_context.Conceptos == null)
            {
                return NotFound();
            }

            var concepto = await _context.Conceptos
                .Where(c => c.ConceptoId == id)
                .Select(c => new ConceptoDTO { ConceptoId = c.ConceptoId, Nombre = c.Nombre })
                .FirstOrDefaultAsync();

            if (concepto == null)
            {
                return NotFound();
            }

            return concepto;
        }

        public class ConceptoInputDTO
        {
            public int ConceptoId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Conceptos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutConcepto(int id, ConceptoInputDTO conceptoDTO)
        {

            var concepto = await _context.Conceptos.FindAsync(id);
            if (concepto == null)
            {
                return NotFound();
            }

            concepto.Nombre = conceptoDTO.Nombre;

            _context.Entry(concepto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConceptoExists(id))
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

        // POST: api/Conceptos
        [HttpPost]
        public async Task<ActionResult<ConceptoDTO>> PostConcepto(ConceptoInputDTO conceptoDTO)
        {
            if (_context.Conceptos == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Conceptos' is null.");
            }

            var concepto = new Concepto { Nombre = conceptoDTO.Nombre };

            _context.Conceptos.Add(concepto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetConcepto", new { id = concepto.ConceptoId }, new ConceptoDTO { ConceptoId = concepto.ConceptoId, Nombre = concepto.Nombre });
        }

        // DELETE: api/Conceptos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConcepto(int id)
        {
            if (_context.Conceptos == null)
            {
                return NotFound();
            }
            var concepto = await _context.Conceptos.FindAsync(id);
            if (concepto == null)
            {
                return NotFound();
            }

            _context.Conceptos.Remove(concepto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ConceptoExists(int id)
        {
            return (_context.Conceptos?.Any(e => e.ConceptoId == id)).GetValueOrDefault();
        }
    }
}
