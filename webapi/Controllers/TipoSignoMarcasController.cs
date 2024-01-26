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
    [Route("TipoSignoMarcas")]
    [ApiController]
    public class TipoSignoMarcasController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoSignoMarcasController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoSignoMarcas()
        {
            if (_context.TipoSignoMarcas == null)
            {
                return NotFound();
            }

            var result = await _context.TipoSignoMarcas
                .Select(t => new { t.TipoSignoMarcaId, t.Nombre })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoSignoMarca(int id)
        {
            if (_context.TipoSignoMarcas == null)
            {
                return NotFound();
            }

            var tipoSignoMarca = await _context.TipoSignoMarcas
                .Where(t => t.TipoSignoMarcaId == id)
                .Select(t => new { t.TipoSignoMarcaId, t.Nombre })
                .FirstOrDefaultAsync();

            if (tipoSignoMarca == null)
            {
                return NotFound();
            }

            return Ok(tipoSignoMarca);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoSignoMarca(int id, TipoSignoMarca tipoSignoMarca)
        {
            if (id != tipoSignoMarca.TipoSignoMarcaId)
            {
                return BadRequest();
            }

            _context.Entry(tipoSignoMarca).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoSignoMarcaExists(id))
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

        public class TipoSignoMarcaCreateDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoSignoMarca>> PostTipoSignoMarca(TipoSignoMarcaCreateDTO tipoSignoMarcaDTO)
        {
            if (_context.TipoSignoMarcas == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoSignoMarcas' is null.");
            }

            var tipoSignoMarca = new TipoSignoMarca
            {
                Nombre = tipoSignoMarcaDTO.Nombre
            };

            _context.TipoSignoMarcas.Add(tipoSignoMarca);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoSignoMarca", new { id = tipoSignoMarca.TipoSignoMarcaId }, tipoSignoMarca);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoSignoMarca(int id)
        {
            if (_context.TipoSignoMarcas == null)
            {
                return NotFound();
            }
            var tipoSignoMarca = await _context.TipoSignoMarcas.FindAsync(id);
            if (tipoSignoMarca == null)
            {
                return NotFound();
            }

            _context.TipoSignoMarcas.Remove(tipoSignoMarca);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool TipoSignoMarcaExists(int id)
        {
            return (_context.TipoSignoMarcas?.Any(e => e.TipoSignoMarcaId == id)).GetValueOrDefault();
        }
    }
}
