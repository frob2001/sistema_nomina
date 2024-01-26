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
    [Route("CentroCosto")]
    [ApiController]
    public class CentroCostosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public CentroCostosController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/CentroCostos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CentroCostoDTO>>> GetCentroCostos()
        {
            if (_context.CentroCostos == null)
            {
                return NotFound();
            }

            var centroCostos = await _context.CentroCostos
                .Select(cc => new CentroCostoDTO { CentroCostoId = cc.CentroCostosId, Nombre = cc.Nombre })
                .ToListAsync();

            return centroCostos;
        }

        // GET: api/CentroCostos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CentroCostoDTO>> GetCentroCosto(int id)
        {
            if (_context.CentroCostos == null)
            {
                return NotFound();
            }

            var centroCosto = await _context.CentroCostos
                .Where(cc => cc.CentroCostosId == id)
                .Select(cc => new CentroCostoDTO { CentroCostoId = cc.CentroCostosId, Nombre = cc.Nombre })
                .FirstOrDefaultAsync();

            if (centroCosto == null)
            {
                return NotFound();
            }

            return centroCosto;
        }

        public class CentroCostoInputDTO
        {
            public int CentroCostoId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/CentroCostos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCentroCosto(int id, CentroCostoInputDTO centroCostoDTO)
        {

            var centroCosto = await _context.CentroCostos.FindAsync(id);
            if (centroCosto == null)
            {
                return NotFound();
            }

            centroCosto.Nombre = centroCostoDTO.Nombre;

            _context.Entry(centroCosto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CentroCostoExists(id))
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

        // POST: api/CentroCostos
        [HttpPost]
        public async Task<ActionResult<CentroCostoDTO>> PostCentroCosto(CentroCostoInputDTO centroCostoDTO)
        {
            if (_context.CentroCostos == null)
            {
                return Problem("Entity set 'SistemaNominaContext.CentroCostos' is null.");
            }

            var centroCosto = new CentroCosto { Nombre = centroCostoDTO.Nombre };

            _context.CentroCostos.Add(centroCosto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCentroCosto", new { id = centroCosto.CentroCostosId }, new CentroCostoDTO { CentroCostoId = centroCosto.CentroCostosId, Nombre = centroCosto.Nombre });
        }

        // DELETE: api/CentroCostos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCentroCosto(int id)
        {
            if (_context.CentroCostos == null)
            {
                return NotFound();
            }
            var centroCosto = await _context.CentroCostos.FindAsync(id);
            if (centroCosto == null)
            {
                return NotFound();
            }

            _context.CentroCostos.Remove(centroCosto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CentroCostoExists(int id)
        {
            return (_context.CentroCostos?.Any(e => e.CentroCostosId == id)).GetValueOrDefault();
        }
    }
}
