using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using webapi.Models;

namespace webapi.Controllers
{
    [Authorize]
    [Route("Autoridades")]
    [ApiController]
    public class AutoridadsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public AutoridadsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAutoridads()
        {
            if (_context.Autoridads == null)
            {
                return NotFound();
            }

            var result = await _context.Autoridads
                .Select(a => new { a.AutoridadId, a.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAutoridad(int id)
        {
            if (_context.Autoridads == null)
            {
                return NotFound();
            }

            var autoridad = await _context.Autoridads
                .Where(a => a.AutoridadId == id)
                .Select(a => new { a.AutoridadId, a.Nombre })
                .FirstOrDefaultAsync();

            if (autoridad == null)
            {
                return NotFound();
            }

            return Ok(autoridad);
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<Autoridad>>> SearchAutoridads(
        string? DropdownSearch,
        string? nombre,
        int? autoridadId)
        {
            if (_context.Autoridads == null)
            {
                return NotFound();
            }

            var query = _context.Autoridads.AsQueryable();


            if (!string.IsNullOrWhiteSpace(DropdownSearch))
            {
                query = query.Where(a => a.Nombre.Contains(DropdownSearch) || a.AutoridadId.ToString().Contains(DropdownSearch));
            }

            // Filtra por nombre si se proporciona
            if (!string.IsNullOrWhiteSpace(nombre))
            {
                query = query.Where(a => a.Nombre.Contains(nombre));
            }

            // Filtra por autoridadId si se proporciona
            if (autoridadId.HasValue)
            {
                query = query.Where(a => a.AutoridadId == autoridadId.Value);
            }

            var autoridades = await query
                .Select(a => new { a.AutoridadId, a.Nombre })
                .ToListAsync();

            return Ok(autoridades);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> PutAutoridad(int id, Autoridad autoridad)
        {
            if (id != autoridad.AutoridadId)
            {
                return BadRequest();
            }

            _context.Entry(autoridad).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AutoridadExists(id))
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

        public class AutoridadCreateModel
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<Autoridad>> PostAutoridad(AutoridadCreateModel autoridadModel)
        {
            if (_context.Autoridads == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Autoridads' is null.");
            }

            if (string.IsNullOrWhiteSpace(autoridadModel.Nombre))
            {
                return BadRequest("El nombre es obligatorio.");
            }

            var autoridad = new Autoridad
            {
                Nombre = autoridadModel.Nombre
            };

            _context.Autoridads.Add(autoridad);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAutoridad", new { id = autoridad.AutoridadId }, autoridad);
        }


        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchAutoridad(int id, JsonPatchDocument<Autoridad> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var autoridad = await _context.Autoridads.FindAsync(id);

            if (autoridad == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(autoridad, ModelState);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AutoridadExists(id))
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


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAutoridad(int id)
        {
            if (_context.Autoridads == null)
            {
                return NotFound();
            }
            var autoridad = await _context.Autoridads.FindAsync(id);
            if (autoridad == null)
            {
                return NotFound();
            }

            _context.Autoridads.Remove(autoridad);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AutoridadExists(int id)
        {
            return (_context.Autoridads?.Any(e => e.AutoridadId == id)).GetValueOrDefault();
        }
    }
}
