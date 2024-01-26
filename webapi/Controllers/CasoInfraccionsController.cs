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
    [Route("Caso")]
    [ApiController]
    public class CasoInfraccionsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public CasoInfraccionsController(KattionDataBaseContext context)
        {
            _context = context;
        }

        


        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<CasoInfraccionDTO>>> SearchCasoInfraccions(string? DropdownSearch)
        {
            if (_context.CasoInfraccions == null)
            {
                return NotFound();
            }

            var query = _context.CasoInfraccions.AsQueryable();

            // Filtrar por ID o número de caso si se proporciona el parámetro de búsqueda
            if (!string.IsNullOrWhiteSpace(DropdownSearch))
            {
                query = query.Where(c => c.NumeroCasoInfraccion.Contains(DropdownSearch) || c.CasoInfraccionId.ToString().Contains(DropdownSearch));
            }

            var casos = await query
                .Select(c => new CasoInfraccionDTO
                {
                    CasoInfraccionId = c.CasoInfraccionId,
                    NumeroCasoInfraccion = c.NumeroCasoInfraccion
                }).Take(50).ToListAsync();

            return casos;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<CasoInfraccionDTO>>> GetCasoInfraccions()
        {
            if (_context.CasoInfraccions == null)
            {
                return NotFound();
            }

            var casos = await _context.CasoInfraccions
                .Select(c => new CasoInfraccionDTO
                {
                    CasoInfraccionId = c.CasoInfraccionId,
                    NumeroCasoInfraccion = c.NumeroCasoInfraccion
                }).ToListAsync();

            return casos;
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCasoInfraccion(int id)
        {
            if (_context.CasoInfraccions == null)
            {
                return NotFound();
            }

            var casoInfraccion = await _context.CasoInfraccions
                .Include(c => c.Infraccions) // Incluye las infracciones asociadas
                .Where(c => c.CasoInfraccionId == id)
                .SelectMany(c => c.Infraccions, (c, i) => new
                {
                    i.InfraccionId,
                    i.ReferenciaInterna
                }).ToListAsync(); // Selecciona solo los campos requeridos de las infracciones

            if (casoInfraccion == null || !casoInfraccion.Any())
            {
                return NotFound();
            }

            return casoInfraccion;
        }


        public class CasoInfraccionInputDTO
        {
            public string? NumeroCasoInfraccion { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<CasoInfraccion>> PostCasoInfraccion(CasoInfraccionInputDTO casoDto)
        {
            if (_context.CasoInfraccions == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.CasoInfraccions' is null.");
            }

            // Verificar si ya existe un caso con el mismo NumeroCasoInfraccion
            var casoExistente = await _context.CasoInfraccions
                                .FirstOrDefaultAsync(c => c.NumeroCasoInfraccion == casoDto.NumeroCasoInfraccion);

            if (casoExistente != null)
            {
                // Retorna el estado 208 si ya existe un caso con el mismo NumeroCasoInfraccion
                return StatusCode(208, "Un caso con el mismo número de infracción ya existe.");
            }

            var casoInfraccion = new CasoInfraccion
            {
                NumeroCasoInfraccion = casoDto.NumeroCasoInfraccion
            };

            _context.CasoInfraccions.Add(casoInfraccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCasoInfraccion", new { id = casoInfraccion.CasoInfraccionId }, casoInfraccion);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutCasoInfraccion(int id, CasoInfraccionDTO casoDto)
        {
            var casoInfraccion = await _context.CasoInfraccions.FindAsync(id);
            if (casoInfraccion == null)
            {
                return NotFound();
            }

            casoInfraccion.NumeroCasoInfraccion = casoDto.NumeroCasoInfraccion;
            // Actualizar otros campos según sea necesario

            _context.Entry(casoInfraccion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CasoInfraccionExists(id))
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
        public async Task<IActionResult> DeleteCasoInfraccion(int id)
        {
            var casoInfraccion = await _context.CasoInfraccions
                .Include(c => c.Infraccions) // Incluye las infracciones asociadas
                .FirstOrDefaultAsync(c => c.CasoInfraccionId == id);

            if (casoInfraccion == null)
            {
                return NotFound();
            }

            // Disociar todas las infracciones asociadas a este caso
            foreach (var infraccion in casoInfraccion.Infraccions)
            {
                infraccion.CasoInfraccions.Remove(casoInfraccion);
            }

            _context.CasoInfraccions.Remove(casoInfraccion);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool CasoInfraccionExists(int id)
        {
            return (_context.CasoInfraccions?.Any(e => e.CasoInfraccionId == id)).GetValueOrDefault();
        }
    }
}
