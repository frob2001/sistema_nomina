using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TipoMarcas")]
    [ApiController]
    public class TipoMarcasController : ControllerBase
    {
        public class TipoMarcaGeneralDTO
        {
            public int TipoMarcaId { get; set; }
            public string Nombre { get; set; }
        }


        private readonly KattionDataBaseContext _context;

        public TipoMarcasController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoMarcaGeneralDTO>>> GetTipoMarcas()
        {
            if (_context.TipoMarcas == null)
            {
                return NotFound();
            }

            var tipoMarcas = await _context.TipoMarcas
                .Select(tm => new TipoMarcaGeneralDTO { TipoMarcaId = tm.TipoMarcaId, Nombre = tm.Nombre })
                .ToListAsync();

            return tipoMarcas;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoMarcaGeneralDTO>> GetTipoMarca(int id)
        {
            if (_context.TipoMarcas == null)
            {
                return NotFound();
            }

            var tipoMarca = await _context.TipoMarcas
                .Where(tm => tm.TipoMarcaId == id)
                .Select(tm => new TipoMarcaGeneralDTO { TipoMarcaId = tm.TipoMarcaId, Nombre = tm.Nombre })
                .FirstOrDefaultAsync();

            if (tipoMarca == null)
            {
                return NotFound();
            }

            return tipoMarca;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoMarca(int id, TipoMarca tipoMarca)
        {
            if (id != tipoMarca.TipoMarcaId)
            {
                return BadRequest();
            }

            _context.Entry(tipoMarca).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoMarcaExists(id))
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
        public async Task<ActionResult<TipoMarca>> PostTipoMarca(TipoMarca tipoMarca)
        {
          if (_context.TipoMarcas == null)
          {
              return Problem("Entity set 'KattionDataBaseContext.TipoMarcas'  is null.");
          }
            _context.TipoMarcas.Add(tipoMarca);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoMarca", new { id = tipoMarca.TipoMarcaId }, tipoMarca);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoMarca(int id)
        {
            if (_context.TipoMarcas == null)
            {
                return NotFound();
            }
            var tipoMarca = await _context.TipoMarcas.FindAsync(id);
            if (tipoMarca == null)
            {
                return NotFound();
            }

            _context.TipoMarcas.Remove(tipoMarca);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoMarcaExists(int id)
        {
            return (_context.TipoMarcas?.Any(e => e.TipoMarcaId == id)).GetValueOrDefault();
        }
    }
}
