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
    [Route("Banco")]
    [ApiController]
    public class BancosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public BancosController(SistemaNominaContext context)
        {
            _context = context;
        }

        // GET: api/Bancos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BancoDTO>>> GetBancos()
        {
            if (_context.Bancos == null)
            {
                return NotFound();
            }

            var bancos = await _context.Bancos
                .Select(b => new BancoDTO { BancoId = b.BancoId, Nombre = b.Nombre })
                .ToListAsync();

            return bancos;
        }

        // GET: api/Bancos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BancoDTO>> GetBanco(int id)
        {
            if (_context.Bancos == null)
            {
                return NotFound();
            }

            var banco = await _context.Bancos
                .Where(b => b.BancoId == id)
                .Select(b => new BancoDTO { BancoId = b.BancoId, Nombre = b.Nombre })
                .FirstOrDefaultAsync();

            if (banco == null)
            {
                return NotFound();
            }

            return banco;
        }

        public class BancoInputDTO
        {
            public int BancoId { get; set; }
            public string? Nombre { get; set; }
        }

        // PUT: api/Bancos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBanco(int id, BancoInputDTO bancoDTO)
        {

            var banco = await _context.Bancos.FindAsync(id);
            if (banco == null)
            {
                return NotFound();
            }

            banco.Nombre = bancoDTO.Nombre;

            _context.Entry(banco).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BancoExists(id))
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

        // POST: api/Bancos
        [HttpPost]
        public async Task<ActionResult<BancoDTO>> PostBanco(BancoInputDTO bancoDTO)
        {
            if (_context.Bancos == null)
            {
                return Problem("Entity set 'SistemaNominaContext.Bancos' is null.");
            }

            var banco = new Banco { Nombre = bancoDTO.Nombre };

            _context.Bancos.Add(banco);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBanco", new { id = banco.BancoId }, new BancoDTO { BancoId = banco.BancoId, Nombre = banco.Nombre });
        }

        // DELETE: api/Bancos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBanco(int id)
        {
            if (_context.Bancos == null)
            {
                return NotFound();
            }
            var banco = await _context.Bancos.FindAsync(id);
            if (banco == null)
            {
                return NotFound();
            }

            _context.Bancos.Remove(banco);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BancoExists(int id)
        {
            return (_context.Bancos?.Any(e => e.BancoId == id)).GetValueOrDefault();
        }
    }
}
