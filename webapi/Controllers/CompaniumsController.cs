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
    [Route("Compania")]
    [ApiController]
    public class CompaniasController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public CompaniasController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/Companias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompaniaDTO>>> GetCompanias()
        {
            if (_context.Compania == null)
            {
                return NotFound();
            }

            var companias = await _context.Compania
                .Select(c => new CompaniaDTO { CompaniaId = c.CompaniaId, Nombre = c.Nombre })
                .ToListAsync();

            return companias;
        }

        // GET: api/Companias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CompaniaDTO>> GetCompania(int id)
        {
            if (_context.Compania == null)
            {
                return NotFound();
            }

            var compania = await _context.Compania
                .Where(c => c.CompaniaId == id)
                .Select(c => new CompaniaDTO { CompaniaId = c.CompaniaId, Nombre = c.Nombre })
                .FirstOrDefaultAsync();

            if (compania == null)
            {
                return NotFound();
            }

            return compania;
        }

        public class CompaniaInputDTO
        {
            public int CompaniaId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Companias/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompania(int id, CompaniaInputDTO companiaDTO)
        {

            var compania = await _context.Compania.FindAsync(id);
            if (compania == null)
            {
                return NotFound();
            }

            compania.Nombre = companiaDTO.Nombre;

            _context.Entry(compania).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompaniaExists(id))
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

        // POST: api/Companias
        [HttpPost]
        public async Task<ActionResult<CompaniaDTO>> PostCompania(CompaniaInputDTO companiaDTO)
        {
            if (_context.Compania == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Companias' is null.");
            }

            var compania = new Companium { Nombre = companiaDTO.Nombre };

            _context.Compania.Add(compania);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCompania", new { id = compania.CompaniaId }, new CompaniaDTO { CompaniaId = compania.CompaniaId, Nombre = compania.Nombre });
        }

        // DELETE: api/Companias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompania(int id)
        {
            if (_context.Compania == null)
            {
                return NotFound();
            }

            var compania = await _context.Compania.FindAsync(id);
            if (compania == null)
            {
                return NotFound();
            }

            // Eliminar o actualizar los roles de pago relacionados
            var rolesPagoRelacionados = _context.RolPagos.Where(rp => rp.CompaniaId == id).ToList();
            foreach (var rolPago in rolesPagoRelacionados)
            {
                _context.RolPagos.Remove(rolPago);
            }


            var empleadosRelacionados = _context.Empleados.Where(e => e.CompaniaId == id).ToList();
            foreach (var empleado in empleadosRelacionados)
            {
                var movimientosPlanillaRelacionados = _context.MovimientosPlanillas.Where(mp => mp.EmpleadoId == empleado.EmpleadoId).ToList();
                foreach (var movimientoPlanilla in movimientosPlanillaRelacionados)
                {
                    _context.MovimientosPlanillas.Remove(movimientoPlanilla);
                }
            }

            foreach (var empleado in empleadosRelacionados)
            {
                _context.Empleados.Remove(empleado);
            }

            _context.Compania.Remove(compania);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private bool CompaniaExists(int id)
        {
            return (_context.Compania?.Any(e => e.CompaniaId == id)).GetValueOrDefault();
        }
    }
}
