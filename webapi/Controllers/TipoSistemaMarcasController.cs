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
    [Route("TipoSistemaMarcas")]
    [ApiController]
    public class TipoSistemaMarcasController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoSistemaMarcasController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoSistemaMarcas()
        {
            if (_context.TipoSistemaMarcas == null)
            {
                return NotFound();
            }

            var result = await _context.TipoSistemaMarcas
                .Select(t => new { t.TipoSistemaMarcaId, t.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoSistemaMarca(int id)
        {
            if (_context.TipoSistemaMarcas == null)
            {
                return NotFound();
            }

            var tipoSistemaMarca = await _context.TipoSistemaMarcas
                .Where(t => t.TipoSistemaMarcaId == id)
                .Select(t => new { t.TipoSistemaMarcaId, t.Nombre })
                .FirstOrDefaultAsync();

            if (tipoSistemaMarca == null)
            {
                return NotFound();
            }

            return Ok(tipoSistemaMarca);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoSistemaMarca(int id, TipoSistemaMarca tipoSistemaMarca)
        {
            if (id != tipoSistemaMarca.TipoSistemaMarcaId)
            {
                return BadRequest();
            }

            _context.Entry(tipoSistemaMarca).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoSistemaMarcaExists(id))
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

        public class TipoSistemaMarcaCreateDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoSistemaMarca>> PostTipoSistemaMarca(TipoSistemaMarcaCreateDTO tipoSistemaMarcaDTO)
        {
            if (_context.TipoSistemaMarcas == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoSistemaMarcas' is null.");
            }

            var tipoSistemaMarca = new TipoSistemaMarca
            {
                Nombre = tipoSistemaMarcaDTO.Nombre
            };

            _context.TipoSistemaMarcas.Add(tipoSistemaMarca);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoSistemaMarca", new { id = tipoSistemaMarca.TipoSistemaMarcaId }, tipoSistemaMarca);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoSistemaMarca(int id)
        {
            if (_context.TipoSistemaMarcas == null)
            {
                return NotFound();
            }
            var tipoSistemaMarca = await _context.TipoSistemaMarcas.FindAsync(id);
            if (tipoSistemaMarca == null)
            {
                return NotFound();
            }

            _context.TipoSistemaMarcas.Remove(tipoSistemaMarca);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoSistemaMarcaExists(int id)
        {
            return (_context.TipoSistemaMarcas?.Any(e => e.TipoSistemaMarcaId == id)).GetValueOrDefault();
        }
    }
}
