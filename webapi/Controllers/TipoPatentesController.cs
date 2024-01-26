using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TipoPatentes")]
    [ApiController]
    public class TipoPatentesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoPatentesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoPatentes()
        {
            if (_context.TipoPatentes == null)
            {
                return NotFound();
            }

            var tipoPatentes = await _context.TipoPatentes
                .Select(tp => new
                {
                    tp.TipoPatenteId,
                    tp.Nombre
                })
                .ToListAsync();

            return tipoPatentes;
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoPatente(int id)
        {
            if (_context.TipoPatentes == null)
            {
                return NotFound();
            }

            var tipoPatente = await _context.TipoPatentes.FindAsync(id);

            if (tipoPatente == null)
            {
                return NotFound();
            }

            var tipoPatenteViewModel = new
            {
                tipoPatente.TipoPatenteId,
                tipoPatente.Nombre
            };

            return tipoPatenteViewModel;
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoPatente(int id, TipoPatente tipoPatente)
        {
            if (id != tipoPatente.TipoPatenteId)
            {
                return BadRequest();
            }

            _context.Entry(tipoPatente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoPatenteExists(id))
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

        public class TipoPatenteDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoPatente>> PostTipoPatente([FromBody] TipoPatenteDTO tipoPatenteDTO)
        {
            if (tipoPatenteDTO == null || _context.TipoPatentes == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoPatentes'  is null.");
            }

            var tipoPatente = new TipoPatente
            {
                Nombre = tipoPatenteDTO.Nombre
            };

            _context.TipoPatentes.Add(tipoPatente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoPatente", new { id = tipoPatente.TipoPatenteId }, tipoPatente);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoPatente(int id)
        {
            if (_context.TipoPatentes == null)
            {
                return NotFound();
            }
            var tipoPatente = await _context.TipoPatentes.FindAsync(id);
            if (tipoPatente == null)
            {
                return NotFound();
            }

            _context.TipoPatentes.Remove(tipoPatente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoPatenteExists(int id)
        {
            return (_context.TipoPatentes?.Any(e => e.TipoPatenteId == id)).GetValueOrDefault();
        }
    }
}
