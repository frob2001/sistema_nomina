using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Authorize]
    [Route("TipoReferencias")]
    [ApiController]
    public class TipoReferenciumsController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoReferenciumsController(KattionDataBaseContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoReferencia()
        {
            if (_context.TipoReferencia == null)
            {
                return NotFound();
            }

            var result = await _context.TipoReferencia
                .Select(tr => new { tr.TipoReferenciaId, tr.Nombre })
                .ToListAsync();

            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoReferencium(int id)
        {
            if (_context.TipoReferencia == null)
            {
                return NotFound();
            }

            var tipoReferencium = await _context.TipoReferencia
                .Where(tr => tr.TipoReferenciaId == id)
                .Select(tr => new { tr.TipoReferenciaId, tr.Nombre })
                .FirstOrDefaultAsync();

            if (tipoReferencium == null)
            {
                return NotFound();
            }

            return Ok(tipoReferencium);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoReferencium(int id, TipoReferencium tipoReferencium)
        {
            if (id != tipoReferencium.TipoReferenciaId)
            {
                return BadRequest();
            }

            _context.Entry(tipoReferencium).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoReferenciumExists(id))
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


        public class TipoReferenciumCreateDTO
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<TipoReferencium>> PostTipoReferencium(TipoReferenciumCreateDTO tipoReferenciumDTO)
        {
            if (_context.TipoReferencia == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.TipoReferencia' is null.");
            }

            var tipoReferencium = new TipoReferencium
            {
                Nombre = tipoReferenciumDTO.Nombre
            };

            _context.TipoReferencia.Add(tipoReferencium);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoReferencium", new { id = tipoReferencium.TipoReferenciaId }, tipoReferencium);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoReferencium(int id)
        {
            if (_context.TipoReferencia == null)
            {
                return NotFound();
            }
            var tipoReferencium = await _context.TipoReferencia.FindAsync(id);
            if (tipoReferencium == null)
            {
                return NotFound();
            }

            _context.TipoReferencia.Remove(tipoReferencium);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoReferenciumExists(int id)
        {
            return (_context.TipoReferencia?.Any(e => e.TipoReferenciaId == id)).GetValueOrDefault();
        }
    }
}
