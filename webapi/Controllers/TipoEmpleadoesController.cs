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
    [Route("TipoEmpleado")]
    [ApiController]
    public class TipoEmpleadosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public TipoEmpleadosController(SistemaNominaContext context)
        {
            _context = context;
        }

        public class TipoEmpleadoDTO
        {
            public int TipoEmpleadoId { get; set; }
            public string? Nombre { get; set; }
        }

        // GET: api/TipoEmpleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoEmpleadoDTO>>> GetTipoEmpleados()
        {
            if (_context.TipoEmpleados == null)
            {
                return NotFound();
            }

            var tipoEmpleados = await _context.TipoEmpleados
                .Select(te => new TipoEmpleadoDTO { TipoEmpleadoId = te.TipoEmpleadoId, Nombre = te.Nombre })
                .ToListAsync();

            return tipoEmpleados;
        }

        // GET: api/TipoEmpleados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoEmpleadoDTO>> GetTipoEmpleado(int id)
        {
            if (_context.TipoEmpleados == null)
            {
                return NotFound();
            }

            var tipoEmpleado = await _context.TipoEmpleados
                .Where(te => te.TipoEmpleadoId == id)
                .Select(te => new TipoEmpleadoDTO { TipoEmpleadoId = te.TipoEmpleadoId, Nombre = te.Nombre })
                .FirstOrDefaultAsync();

            if (tipoEmpleado == null)
            {
                return NotFound();
            }

            return tipoEmpleado;
        }

        public class TipoEmpleadoInputDTO
        {
            public int TipoEmpleadoId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/TipoEmpleados/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoEmpleado(int id, TipoEmpleadoInputDTO tipoEmpleadoDTO)
        {

            var tipoEmpleado = await _context.TipoEmpleados.FindAsync(id);
            if (tipoEmpleado == null)
            {
                return NotFound();
            }

            tipoEmpleado.Nombre = tipoEmpleadoDTO.Nombre;

            _context.Entry(tipoEmpleado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoEmpleadoExists(id))
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

        // POST: api/TipoEmpleados
        [HttpPost]
        public async Task<ActionResult<TipoEmpleadoDTO>> PostTipoEmpleado(TipoEmpleadoInputDTO tipoEmpleadoDTO)
        {
            if (_context.TipoEmpleados == null)
            {
                return Problem("Entity set 'SistemaNominaContext.TipoEmpleados' is null.");
            }

            var tipoEmpleado = new TipoEmpleado { Nombre = tipoEmpleadoDTO.Nombre };

            _context.TipoEmpleados.Add(tipoEmpleado);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoEmpleado", new { id = tipoEmpleado.TipoEmpleadoId }, new TipoEmpleadoDTO { TipoEmpleadoId = tipoEmpleado.TipoEmpleadoId, Nombre = tipoEmpleado.Nombre });
        }

        // DELETE: api/TipoEmpleados/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoEmpleado(int id)
        {
            if (_context.TipoEmpleados == null)
            {
                return NotFound();
            }
            var tipoEmpleado = await _context.TipoEmpleados.FindAsync(id);
            if (tipoEmpleado == null)
            {
                return NotFound();
            }

            _context.TipoEmpleados.Remove(tipoEmpleado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoEmpleadoExists(int id)
        {
            return (_context.TipoEmpleados?.Any(e => e.TipoEmpleadoId == id)).GetValueOrDefault();
        }
    }
}
