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
    [Route("TipoContactoClientes")]
    [ApiController]
    public class TipoContactoClientesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public TipoContactoClientesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTipoContactoClientes()
        {
            if (_context.TipoContactoClientes == null)
            {
                return NotFound();
            }

            var tipoContactoClientes = await _context.TipoContactoClientes
                .Select(tc => new
                {
                    tc.TipoContactoClienteId,
                    tc.Nombre
                })
                .ToListAsync();

            return tipoContactoClientes;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTipoContactoCliente(int id)
        {
            if (_context.TipoContactoClientes == null)
            {
                return NotFound();
            }

            var tipoContactoCliente = await _context.TipoContactoClientes
                .Where(tc => tc.TipoContactoClienteId == id)
                .Select(tc => new
                {
                    tc.TipoContactoClienteId,
                    tc.Nombre
                })
                .FirstOrDefaultAsync();

            if (tipoContactoCliente == null)
            {
                return NotFound();
            }

            return tipoContactoCliente;
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoContactoCliente(int id, TipoContactoCliente tipoContactoCliente)
        {
            if (id != tipoContactoCliente.TipoContactoClienteId)
            {
                return BadRequest();
            }

            _context.Entry(tipoContactoCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoContactoClienteExists(id))
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
        public async Task<ActionResult<TipoContactoCliente>> PostTipoContactoCliente(TipoContactoCliente tipoContactoCliente)
        {
          if (_context.TipoContactoClientes == null)
          {
              return Problem("Entity set 'KattionDataBaseContext.TipoContactoClientes'  is null.");
          }
            _context.TipoContactoClientes.Add(tipoContactoCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoContactoCliente", new { id = tipoContactoCliente.TipoContactoClienteId }, tipoContactoCliente);
        }

 
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoContactoCliente(int id)
        {
            if (_context.TipoContactoClientes == null)
            {
                return NotFound();
            }
            var tipoContactoCliente = await _context.TipoContactoClientes.FindAsync(id);
            if (tipoContactoCliente == null)
            {
                return NotFound();
            }

            _context.TipoContactoClientes.Remove(tipoContactoCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoContactoClienteExists(int id)
        {
            return (_context.TipoContactoClientes?.Any(e => e.TipoContactoClienteId == id)).GetValueOrDefault();
        }
    }
}
