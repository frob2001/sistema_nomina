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
    [Route("Abogados")]
    [ApiController]
    public class AbogadoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public AbogadoesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAbogados()
        {
            if (_context.Abogados == null)
            {
                return NotFound();
            }

            var abogados = await _context.Abogados
                .Select(abogado => new
                {
                    abogado.AbogadoId,
                    abogado.Nombre,
                    abogado.Apellido,
                    abogado.Identificacion,
                    abogado.Matricula,
                    abogado.Email,
                    abogado.Telefono
                })
                .ToListAsync();

            return abogados;
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAbogado(int id)
        {
            if (_context.Abogados == null)
            {
                return NotFound();
            }

            var abogado = await _context.Abogados
                .Where(a => a.AbogadoId == id)
                .Select(a => new
                {
                    a.AbogadoId,
                    a.Nombre,
                    a.Apellido,
                    a.Identificacion,
                    a.Matricula,
                    a.Email,
                    a.Telefono
                })
                .FirstOrDefaultAsync();

            if (abogado == null)
            {
                return NotFound();
            }

            return abogado;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAbogado(int id, Abogado abogado)
        {
            if (id != abogado.AbogadoId)
            {
                return BadRequest();
            }

            _context.Entry(abogado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AbogadoExists(id))
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


        [HttpPost]
        public async Task<ActionResult<object>> PostAbogado(Abogado abogado)
        {
            if (_context.Abogados == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Abogados' is null.");
            }

            _context.Abogados.Add(abogado);
            await _context.SaveChangesAsync();

            var result = new
            {
                abogado.AbogadoId,
                abogado.Nombre,
                abogado.Apellido,
                abogado.Identificacion,
                abogado.Matricula,
                abogado.Email,
                abogado.Telefono
            };

            return CreatedAtAction("GetAbogado", new { id = abogado.AbogadoId }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAbogado(int id)
        {
            if (_context.Abogados == null)
            {
                return NotFound();
            }

            var abogado = await _context.Abogados.FindAsync(id);
            if (abogado == null)
            {
                return NotFound();
            }

            _context.Abogados.Remove(abogado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AbogadoExists(int id)
        {
            return (_context.Abogados?.Any(e => e.AbogadoId == id)).GetValueOrDefault();
        }
    }
}
