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
    [Route("Sucursal")]
    [ApiController]
    public class SucursalsController : ControllerBase
    {
        private readonly SistemanominaContext _context;

        public SucursalsController(SistemanominaContext context)
        {
            _context = context;
        }

        // GET: api/Sucursals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SucursalDTO>>> GetSucursals()
        {
            if (_context.Sucursals == null)
            {
                return NotFound();
            }

            var sucursales = await _context.Sucursals
                .Select(s => new SucursalDTO { SucursalId = s.SucursalId, Nombre = s.Nombre })
                .ToListAsync();

            return sucursales;
        }

        // GET: api/Sucursals/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SucursalDTO>> GetSucursal(int id)
        {
            if (_context.Sucursals == null)
            {
                return NotFound();
            }

            var sucursal = await _context.Sucursals
                .Where(s => s.SucursalId == id)
                .Select(s => new SucursalDTO { SucursalId = s.SucursalId, Nombre = s.Nombre })
                .FirstOrDefaultAsync();

            if (sucursal == null)
            {
                return NotFound();
            }

            return sucursal;
        }

        public class SucursalInputDTO
        {
            public int SucursalId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Sucursals/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSucursal(int id, SucursalInputDTO sucursalDTO)
        {

            var sucursal = await _context.Sucursals.FindAsync(id);
            if (sucursal == null)
            {
                return NotFound();
            }

            sucursal.Nombre = sucursalDTO.Nombre;

            _context.Entry(sucursal).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SucursalExists(id))
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

        // POST: api/Sucursals
        [HttpPost]
        public async Task<ActionResult<SucursalDTO>> PostSucursal(SucursalInputDTO sucursalDTO)
        {
            if (_context.Sucursals == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Sucursals' is null.");
            }

            var sucursal = new Sucursal { Nombre = sucursalDTO.Nombre };

            _context.Sucursals.Add(sucursal);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSucursal", new { id = sucursal.SucursalId }, new SucursalDTO { SucursalId = sucursal.SucursalId, Nombre = sucursal.Nombre });
        }

        // DELETE: api/Sucursals/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSucursal(int id)
        {
            if (_context.Sucursals == null)
            {
                return NotFound();
            }
            var sucursal = await _context.Sucursals.FindAsync(id);
            if (sucursal == null)
            {
                return NotFound();
            }

            _context.Sucursals.Remove(sucursal);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SucursalExists(int id)
        {
            return (_context.Sucursals?.Any(e => e.SucursalId == id)).GetValueOrDefault();
        }
    }
}
