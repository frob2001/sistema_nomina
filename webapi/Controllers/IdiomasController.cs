using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("Idiomas")]
    [ApiController]
    public class IdiomasController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public IdiomasController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetIdiomas()
        {
            if (_context.Idiomas == null)
            {
                return NotFound();
            }
            var idiomas = await _context.Idiomas
                .Select(idioma => new { idioma.CodigoIdioma, idioma.Nombre })
                .ToListAsync();
            return idiomas;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetIdioma(string id)
        {
            if (_context.Idiomas == null)
            {
                return NotFound();
            }
            var idioma = await _context.Idiomas
                .Where(i => i.CodigoIdioma == id)
                .Select(i => new { i.CodigoIdioma, i.Nombre })
                .FirstOrDefaultAsync();

            if (idioma == null)
            {
                return NotFound();
            }

            return idioma;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIdioma(string id, Idioma idioma)
        {
            if (id != idioma.CodigoIdioma)
            {
                return BadRequest();
            }

            _context.Entry(idioma).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IdiomaExists(id))
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

        public class IdiomaCreateModel
        {
            public string CodigoIdioma { get; set; }
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<object>> PostIdioma(IdiomaCreateModel idiomaModel)
        {
            if (_context.Idiomas == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Idiomas' is null.");
            }

            if (string.IsNullOrWhiteSpace(idiomaModel.CodigoIdioma) || string.IsNullOrWhiteSpace(idiomaModel.Nombre))
            {
                return BadRequest("El código de idioma y el nombre son obligatorios.");
            }

            var idioma = new Idioma
            {
                CodigoIdioma = idiomaModel.CodigoIdioma,
                Nombre = idiomaModel.Nombre
            };

            _context.Idiomas.Add(idioma);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (IdiomaExists(idioma.CodigoIdioma))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            var result = new { idioma.CodigoIdioma, idioma.Nombre };
            return CreatedAtAction("GetIdioma", new { id = idioma.CodigoIdioma }, result);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIdioma(string id)
        {
            if (_context.Idiomas == null)
            {
                return NotFound();
            }
            var idioma = await _context.Idiomas.FindAsync(id);
            if (idioma == null)
            {
                return NotFound();
            }

            _context.Idiomas.Remove(idioma);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IdiomaExists(string id)
        {
            return (_context.Idiomas?.Any(e => e.CodigoIdioma == id)).GetValueOrDefault();
        }
    }
}
