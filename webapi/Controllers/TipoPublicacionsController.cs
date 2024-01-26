using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TipoPublicaciones")]
    [ApiController]
    public class TipoPublicacionsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoPublicacionsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoPublicacions()
        {
            if (_context.TipoPublicacions == null)
            {
                return NotFound();
            }

            var result = await _context.TipoPublicacions
                .Select(tp => new { tp.TipoPublicacionId, tp.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoPublicacion(int id)
        {
            if (_context.TipoPublicacions == null)
            {
                return NotFound();
            }

            var tipoPublicacion = await _context.TipoPublicacions
                .Where(tp => tp.TipoPublicacionId == id)
                .Select(tp => new { tp.TipoPublicacionId, tp.Nombre })
                .FirstOrDefaultAsync();

            if (tipoPublicacion == null)
            {
                return NotFound();
            }

            return Ok(tipoPublicacion);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoPublicacion(int id, TipoPublicacion tipoPublicacion)
        {
            if (id != tipoPublicacion.TipoPublicacionId)
            {
                return BadRequest();
            }

            _context.Entry(tipoPublicacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoPublicacionExists(id))
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

        public class TipoPublicacionCreateDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoPublicacion>> PostTipoPublicacion(TipoPublicacionCreateDTO tipoPublicacionDTO)
        {
            if (_context.TipoPublicacions == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoPublicacions' is null.");
            }

            var tipoPublicacion = new TipoPublicacion
            {
                Nombre = tipoPublicacionDTO.Nombre
            };

            _context.TipoPublicacions.Add(tipoPublicacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoPublicacion", new { id = tipoPublicacion.TipoPublicacionId }, tipoPublicacion);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoPublicacion(int id)
        {
            if (_context.TipoPublicacions == null)
            {
                return NotFound();
            }
            var tipoPublicacion = await _context.TipoPublicacions.FindAsync(id);
            if (tipoPublicacion == null)
            {
                return NotFound();
            }

            _context.TipoPublicacions.Remove(tipoPublicacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoPublicacionExists(int id)
        {
            return (_context.TipoPublicacions?.Any(e => e.TipoPublicacionId == id)).GetValueOrDefault();
        }
    }
}
