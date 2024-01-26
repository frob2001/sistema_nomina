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
    [Route("TipoInfracciones")]
    [ApiController]
    public class TipoInfraccionsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoInfraccionsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoInfraccions()
        {
            if (_context.TipoInfraccions == null)
            {
                return NotFound();
            }

            var result = await _context.TipoInfraccions
                .Select(ti => new { ti.TipoInfraccionId, ti.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoInfraccion(int id)
        {
            if (_context.TipoInfraccions == null)
            {
                return NotFound();
            }

            var tipoInfraccion = await _context.TipoInfraccions
                .Where(ti => ti.TipoInfraccionId == id)
                .Select(ti => new { ti.TipoInfraccionId, ti.Nombre })
                .FirstOrDefaultAsync();

            if (tipoInfraccion == null)
            {
                return NotFound();
            }

            return Ok(tipoInfraccion);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoInfraccion(int id, TipoInfraccion tipoInfraccion)
        {
            if (id != tipoInfraccion.TipoInfraccionId)
            {
                return BadRequest();
            }

            _context.Entry(tipoInfraccion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoInfraccionExists(id))
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

        public class TipoInfraccionInputDTO
        {
            public string Nombre { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<TipoInfraccion>> PostTipoInfraccion(TipoInfraccionInputDTO TipoInfraccionInputDTO)
        {
            if (_context.TipoInfraccions == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoInfraccions' is null.");
            }

            var tipoInfraccion = new TipoInfraccion
            {
                Nombre = TipoInfraccionInputDTO.Nombre
            };

            _context.TipoInfraccions.Add(tipoInfraccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoInfraccion", new { id = tipoInfraccion.TipoInfraccionId }, tipoInfraccion);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoInfraccion(int id)
        {
            if (_context.TipoInfraccions == null)
            {
                return NotFound();
            }
            var tipoInfraccion = await _context.TipoInfraccions.FindAsync(id);
            if (tipoInfraccion == null)
            {
                return NotFound();
            }

            _context.TipoInfraccions.Remove(tipoInfraccion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoInfraccionExists(int id)
        {
            return (_context.TipoInfraccions?.Any(e => e.TipoInfraccionId == id)).GetValueOrDefault();
        }
    }
}
