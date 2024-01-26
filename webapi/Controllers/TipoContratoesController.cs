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
    [Route("TipoContrato")]
    [ApiController]
    public class TipoContratosController : ControllerBase
    {
        private readonly SistemanominaContext _context;

        public TipoContratosController(SistemanominaContext context)
        {
            _context = context;
        }

        // GET: api/TipoContratos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoContratoDTO>>> GetTipoContratos()
        {
            if (_context.TipoContratos == null)
            {
                return NotFound();
            }

            var tipoContratos = await _context.TipoContratos
                .Select(tc => new TipoContratoDTO { TipoContratoId = tc.TipoContratoId, Nombre = tc.Nombre })
                .ToListAsync();

            return tipoContratos;
        }

        // GET: api/TipoContratos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoContratoDTO>> GetTipoContrato(int id)
        {
            if (_context.TipoContratos == null)
            {
                return NotFound();
            }

            var tipoContrato = await _context.TipoContratos
                .Where(tc => tc.TipoContratoId == id)
                .Select(tc => new TipoContratoDTO { TipoContratoId = tc.TipoContratoId, Nombre = tc.Nombre })
                .FirstOrDefaultAsync();

            if (tipoContrato == null)
            {
                return NotFound();
            }

            return tipoContrato;
        }

        public class TipoContratoInputDTO
        {
            public int TipoContratoId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/TipoContratos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoContrato(int id, TipoContratoInputDTO tipoContratoDTO)
        {

            var tipoContrato = await _context.TipoContratos.FindAsync(id);
            if (tipoContrato == null)
            {
                return NotFound();
            }

            tipoContrato.Nombre = tipoContratoDTO.Nombre;

            _context.Entry(tipoContrato).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoContratoExists(id))
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

        // POST: api/TipoContratos
        [HttpPost]
        public async Task<ActionResult<TipoContratoDTO>> PostTipoContrato(TipoContratoInputDTO tipoContratoDTO)
        {
            if (_context.TipoContratos == null)
            {
                return Problem("Entity set 'SistemaNominaContext.TipoContratos' is null.");
            }

            var tipoContrato = new TipoContrato { Nombre = tipoContratoDTO.Nombre };

            _context.TipoContratos.Add(tipoContrato);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoContrato", new { id = tipoContrato.TipoContratoId }, new TipoContratoDTO { TipoContratoId = tipoContrato.TipoContratoId, Nombre = tipoContrato.Nombre });
        }

        // DELETE: api/TipoContratos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoContrato(int id)
        {
            if (_context.TipoContratos == null)
            {
                return NotFound();
            }
            var tipoContrato = await _context.TipoContratos.FindAsync(id);
            if (tipoContrato == null)
            {
                return NotFound();
            }

            _context.TipoContratos.Remove(tipoContrato);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoContratoExists(int id)
        {
            return (_context.TipoContratos?.Any(e => e.TipoContratoId == id)).GetValueOrDefault();
        }
    }
}
