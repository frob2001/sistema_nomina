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
    [Route("Clases")]
    [ApiController]
    public class ClasesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public ClasesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetClases()
        {
            if (_context.Clases == null)
            {
                return NotFound();
            }

            var result = await _context.Clases
                .Select(clase => new
                {
                    clase.Codigo,
                    clase.DescripcionEspanol,
                    clase.DescripcionIngles
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetClase(int id)
        {
            if (_context.Clases == null)
            {
                return NotFound();
            }

            var clase = await _context.Clases
                .Where(clase => clase.Codigo == id)
                .Select(clase => new
                {
                    clase.Codigo,
                    clase.DescripcionEspanol,
                    clase.DescripcionIngles
                })
                .FirstOrDefaultAsync();

            if (clase == null)
            {
                return NotFound();
            }

            return Ok(clase);
        }

        [HttpGet("Marca/{marcaId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetClasesByMarca(int marcaId)
        {
            if (_context.MarcaClases == null)
            {
                return NotFound("MarcaClase entity set is null.");
            }

            // Consultar MarcaClase para obtener las clases asociadas con la marca especificada
            var marcaClases = await _context.MarcaClases
                                            .Where(mc => mc.MarcaId == marcaId)
                                            .Include(mc => mc.CodigoClaseNavigation)
                                            .ToListAsync();

            if (marcaClases == null || !marcaClases.Any())
            {
                return NotFound($"No se encontraron clases asociadas con la marca de id {marcaId}.");
            }

            // Crear una lista de clases a partir de los resultados
            var clases = marcaClases.Select(mc => new
            {
                Codigo = mc.CodigoClaseNavigation.Codigo,
                DescripcionEspanol = mc.CodigoClaseNavigation.DescripcionEspanol,
                DescripcionIngles = mc.CodigoClaseNavigation.DescripcionIngles
            }).ToList();

            return clases;
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> PutClase(int id, Clase clase)
        {
            if (id != clase.Codigo)
            {
                return BadRequest();
            }

            _context.Entry(clase).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClaseExists(id))
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

        public class ClaseCreateModel
        {
            public int Codigo { get; set; }
            public string DescripcionEspanol { get; set; }
            public string DescripcionIngles { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<Clase>> PostClase(ClaseCreateModel claseModel)
        {
            if (_context.Clases == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Clases' is null.");
            }

            if (string.IsNullOrWhiteSpace(claseModel.DescripcionEspanol) || string.IsNullOrWhiteSpace(claseModel.DescripcionIngles))
            {
                return BadRequest("La descripción en español e inglés son obligatorias.");
            }

            var clase = new Clase
            {
                Codigo = claseModel.Codigo,
                DescripcionEspanol = claseModel.DescripcionEspanol,
                DescripcionIngles = claseModel.DescripcionIngles
            };

            _context.Clases.Add(clase);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClase", new { id = clase.Codigo }, clase);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClase(int id)
        {
            if (_context.Clases == null)
            {
                return NotFound();
            }
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null)
            {
                return NotFound();
            }

            _context.Clases.Remove(clase);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClaseExists(int id)
        {
            return (_context.Clases?.Any(e => e.Codigo == id)).GetValueOrDefault();
        }
    }
}
