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
    [Route("TipoCuenta")]
    [ApiController]
    public class TipoCuentasController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public TipoCuentasController(SistemaNominaContext context)
        {
            _context = context;
        }

        public class TipoCuentaDTO
        {
            public int TipoCuentaId { get; set; }
            public string? Nombre { get; set; }
        }

        // GET: api/TipoCuentas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoCuentaDTO>>> GetTipoCuentas()
        {
            if (_context.TipoCuenta == null)
            {
                return NotFound();
            }

            var tipoCuentas = await _context.TipoCuenta
                .Select(tc => new TipoCuentaDTO { TipoCuentaId = tc.TipoCuentaId, Nombre = tc.Nombre })
                .ToListAsync();

            return tipoCuentas;
        }

        // GET: api/TipoCuentas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoCuentaDTO>> GetTipoCuenta(int id)
        {
            if (_context.TipoCuenta == null)
            {
                return NotFound();
            }

            var tipoCuenta = await _context.TipoCuenta
                .Where(tc => tc.TipoCuentaId == id)
                .Select(tc => new TipoCuentaDTO { TipoCuentaId = tc.TipoCuentaId, Nombre = tc.Nombre })
                .FirstOrDefaultAsync();

            if (tipoCuenta == null)
            {
                return NotFound();
            }

            return tipoCuenta;
        }

        public class TipoCuentaInputDTO
        {
            public int TipoCuentaId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/TipoCuentas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoCuenta(int id, TipoCuentaInputDTO tipoCuentaDTO)
        {

            var tipoCuenta = await _context.TipoCuenta.FindAsync(id);
            if (tipoCuenta == null)
            {
                return NotFound();
            }

            tipoCuenta.Nombre = tipoCuentaDTO.Nombre;

            _context.Entry(tipoCuenta).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoCuentaExists(id))
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

        // POST: api/TipoCuentas
        [HttpPost]
        public async Task<ActionResult<TipoCuentaDTO>> PostTipoCuenta(TipoCuentaInputDTO tipoCuentaDTO)
        {
            if (_context.TipoCuenta == null)
            {
                return Problem("Entity set 'SistemaNominaContext.TipoCuentas' is null.");
            }

            var tipoCuenta = new TipoCuentum { Nombre = tipoCuentaDTO.Nombre };

            _context.TipoCuenta.Add(tipoCuenta);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoCuenta", new { id = tipoCuenta.TipoCuentaId }, new TipoCuentaDTO { TipoCuentaId = tipoCuenta.TipoCuentaId, Nombre = tipoCuenta.Nombre });
        }

        // DELETE: api/TipoCuentas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoCuenta(int id)
        {
            if (_context.TipoCuenta == null)
            {
                return NotFound();
            }
            var tipoCuenta = await _context.TipoCuenta.FindAsync(id);
            if (tipoCuenta == null)
            {
                return NotFound();
            }

            _context.TipoCuenta.Remove(tipoCuenta);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoCuentaExists(int id)
        {
            return (_context.TipoCuenta?.Any(e => e.TipoCuentaId == id)).GetValueOrDefault();
        }
    }
}
