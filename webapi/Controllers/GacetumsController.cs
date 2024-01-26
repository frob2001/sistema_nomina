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
    [Route("Gacetas")]
    [ApiController]
    public class GacetumsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public GacetumsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class GacetaDTO
        {
            public int Numero { get; set; }
            public DateTime? Fecha { get; set; }
            public string? UrlGaceta { get; set; }
            public PaisDTO Pais { get; set; }   
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetGaceta()
        {
            if (_context.Gaceta == null)
            {
                return NotFound();
            }

            var result = await _context.Gaceta
                .Include(g => g.CodigoPaisNavigation)
                .Select(g => new GacetaDTO
                {
                    Numero = g.Numero,
                    Fecha = g.Fecha,
                    UrlGaceta = g.UrlGaceta,
                    Pais = new PaisDTO
                    {
                        Nombre = g.CodigoPaisNavigation.Nombre,
                        CodigoPais = g.CodigoPaisNavigation.CodigoPais
                    }

                })
                .ToListAsync();

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGacetum(int id)
        {
            if (_context.Gaceta == null)
            {
                return NotFound();
            }

            var gacetum = await _context.Gaceta
                .Where(g => g.Numero == id)
                .Include(g => g.CodigoPaisNavigation)
                .Select(g => new GacetaDTO
                {
                    Numero = g.Numero,
                    Fecha = g.Fecha,
                    UrlGaceta = g.UrlGaceta,
                    Pais = new PaisDTO
                    {
                        Nombre = g.CodigoPaisNavigation.Nombre,
                        CodigoPais = g.CodigoPaisNavigation.CodigoPais
                    }

                })
                .FirstOrDefaultAsync();

            if (gacetum == null)
            {
                return NotFound();
            }

            return gacetum;
        }

        public class GacetumCreateModel
        {
            public int Numero { get; set; }
            public DateTime Fecha { get; set; }
            public string CodigoPais { get; set; }
            public string UrlGaceta { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<Gacetum>> PostGacetum(GacetumCreateModel gacetumModel)
        {
            if (_context.Gaceta == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Gaceta' is null.");
            }

            if (string.IsNullOrWhiteSpace(gacetumModel.CodigoPais) || string.IsNullOrWhiteSpace(gacetumModel.UrlGaceta))
            {
                return BadRequest("El código de país y la URL de la gaceta son obligatorios.");
            }

            var gacetum = new Gacetum
            {
                Numero = gacetumModel.Numero,
                Fecha = gacetumModel.Fecha,
                CodigoPais = gacetumModel.CodigoPais,
                UrlGaceta = gacetumModel.UrlGaceta
            };

            _context.Gaceta.Add(gacetum);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (GacetumExists(gacetum.Numero))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetGacetum", new { id = gacetum.Numero }, gacetum);
        }

        public class GacetumUpdateModel
        {
            public DateTime Fecha { get; set; }
            public string CodigoPais { get; set; }
            public string UrlGaceta { get; set; }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutGacetum(int id, GacetumUpdateModel gacetumModel)
        {

            var gacetumToUpdate = await _context.Gaceta.FindAsync(id);
            if (gacetumToUpdate == null)
            {
                return NotFound();
            }

            gacetumToUpdate.Fecha = gacetumModel.Fecha;
            gacetumToUpdate.CodigoPais = gacetumModel.CodigoPais;
            gacetumToUpdate.UrlGaceta = gacetumModel.UrlGaceta;

            _context.Entry(gacetumToUpdate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GacetumExists(id))
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



        // DELETE: api/Gacetums/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGacetum(int id)
        {
            if (_context.Gaceta == null)
            {
                return NotFound();
            }
            var gacetum = await _context.Gaceta.FindAsync(id);
            if (gacetum == null)
            {
                return NotFound();
            }

            _context.Gaceta.Remove(gacetum);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GacetumExists(int id)
        {
            return (_context.Gaceta?.Any(e => e.Numero == id)).GetValueOrDefault();
        }
    }
}
