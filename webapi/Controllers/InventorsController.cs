using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.PropietariosController;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("Inventores")]
    [ApiController]
    public class InventorsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public InventorsController(KattionDataBaseContext context)
        {
            _context = context;
        }


        public class InventorDto
        {
            public int InventorId { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
            public string? Direccion { get; set; }
            public PaisDTO Pais { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventorDto>>> GetInventors()
        {
            if (_context.Inventors == null)
            {
                return NotFound();
            }
            var inventors = await _context.Inventors
                .Include(i => i.CodigoPaisNavigation)
                .Select(i => new InventorDto
                {
                    InventorId = i.InventorId,
                    Nombre = i.Nombre,
                    Apellido = i.Apellido,
                    Direccion = i.Direccion,
                    Pais = new PaisDTO
                    {
                        Nombre = i.CodigoPaisNavigation.Nombre,
                        CodigoPais = i.CodigoPaisNavigation.CodigoPais
                    }
                })
                .ToListAsync();

            return Ok(inventors);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<InventorDto>> GetInventorById(int id)
        {
            if (_context.Inventors == null)
            {
                return NotFound();
            }

            var inventor = await _context.Inventors
                .Include(i => i.CodigoPaisNavigation)
                .FirstOrDefaultAsync(i => i.InventorId == id);

            if (inventor == null)
            {
                return NotFound();
            }

            var inventorDto = new InventorDto
            {
                InventorId = inventor.InventorId,
                Nombre = inventor.Nombre,
                Apellido = inventor.Apellido,
                Direccion = inventor.Direccion,
                Pais = new PaisDTO
                {
                    Nombre = inventor.CodigoPaisNavigation.Nombre,
                    CodigoPais = inventor.CodigoPaisNavigation.CodigoPais
                }
            };

            return Ok(inventorDto);
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<InventorDto>>> SearchInventors(
            [FromQuery] string? dropdownSearch = "",
            [FromQuery] int? inventorId = null,
            [FromQuery] string nombre = "",
            [FromQuery] string apellido = "",
            [FromQuery] string direccion = "",
            [FromQuery] string codigoPais = "",
            [FromQuery] bool cantidad = false)
        {
            if (_context.Inventors == null)
            {
                return NotFound();
            }

            var query = _context.Inventors
                .Include(i => i.CodigoPaisNavigation)
                .AsQueryable();

            cantidad = false;

            if (!string.IsNullOrEmpty(dropdownSearch))
            {
                query = query.Where(i => i.Nombre.Contains(dropdownSearch) || i.Apellido.Contains(dropdownSearch) || i.InventorId.ToString().Contains(dropdownSearch));
                cantidad = true;
            }
  

            if (inventorId != null)
            {
                query = query.Where(i => i.InventorId.ToString().Contains(inventorId.ToString()));
            }

            if (!string.IsNullOrEmpty(nombre))
            {
                query = query.Where(i => i.Nombre.Contains(nombre));
            }

            if (!string.IsNullOrEmpty(apellido))
            {
                query = query.Where(i => i.Apellido.Contains(apellido));
            }

            if (!string.IsNullOrEmpty(direccion))
            {
                query = query.Where(i => i.Direccion.Contains(direccion));
            }

            if (!string.IsNullOrEmpty(codigoPais))
            {
                query = query.Where(i => i.CodigoPaisNavigation.CodigoPais == codigoPais);
            }

            var inventors = new List<InventorDto>();   

            if(cantidad)
            {
                inventors = await query
                .Select(i => new InventorDto
                {
                    InventorId = i.InventorId,
                    Nombre = i.Nombre,
                    Apellido = i.Apellido,
                    Direccion = i.Direccion,
                    Pais = new PaisDTO
                    {
                        Nombre = i.CodigoPaisNavigation.Nombre,
                        CodigoPais = i.CodigoPaisNavigation.CodigoPais
                    }
                })
                .Take(50)
                .ToListAsync();
            }
            else
            {
                inventors = await query
                .Select(i => new InventorDto
                {
                    InventorId = i.InventorId,
                    Nombre = i.Nombre,
                    Apellido = i.Apellido,
                    Direccion = i.Direccion,
                    Pais = new PaisDTO
                    {
                        Nombre = i.CodigoPaisNavigation.Nombre,
                        CodigoPais = i.CodigoPaisNavigation.CodigoPais
                    }
                })
                .ToListAsync();
            }



            return Ok(inventors);
        }

        public class InventorInput
        {
            public int InventorId { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
            public string? Direccion { get; set; }
            public string? CodigoPais { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<InventorInput>> PostPropietario(InventorInput InventorInput)
        {
            if (_context.Inventors == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Inventors' is null.");
            }

            var inventor = new Inventor
            {
                Nombre = InventorInput.Nombre,
                Apellido = InventorInput.Apellido,
                Direccion = InventorInput.Direccion,
                CodigoPais = InventorInput.CodigoPais
            };

            _context.Inventors.Add(inventor);
            await _context.SaveChangesAsync();


            InventorInput.InventorId = inventor.InventorId;
            return CreatedAtAction("GetInventorById", new { id = inventor.InventorId }, InventorInput);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutInventor(int id, InventorInput inventorInput)
        {
            if (id != inventorInput.InventorId)
            {
                return BadRequest();
            }

            var inventor = await _context.Inventors.FindAsync(id);
            if (inventor == null)
            {
                return NotFound();
            }

            inventor.Nombre = inventorInput.Nombre;
            inventor.Apellido = inventorInput.Apellido;
            inventor.Direccion = inventorInput.Direccion;
            inventor.CodigoPais = inventorInput.CodigoPais;

            _context.Entry(inventor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventorExists(id))
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


        // DELETE: api/Inventors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventor(int id)
        {
            if (_context.Inventors == null)
            {
                return NotFound();
            }
            var inventor = await _context.Inventors.FindAsync(id);
            if (inventor == null)
            {
                return NotFound();
            }

            _context.Inventors.Remove(inventor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InventorExists(int id)
        {
            return (_context.Inventors?.Any(e => e.InventorId == id)).GetValueOrDefault();
        }
    }
}
