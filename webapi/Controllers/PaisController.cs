using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using webapi.Models;
using static webapi.Controllers.PaisController;
using Microsoft.AspNetCore.Authorization;



namespace webapi.Controllers
{
    [Authorize]
    [Route("Pais")]
    [ApiController]
    public class PaisController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public PaisController(KattionDataBaseContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaisDTO>>> GetPais()
        {
            if (_context.Pais == null)
            {
                return NotFound();
            }

            var PaisDTOs = await _context.Pais
                .Select(p => new PaisDTO
                {
                    CodigoPais = p.CodigoPais,
                    Nombre = p.Nombre
                })
                .ToListAsync();

            return PaisDTOs;
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<PaisDTO>> GetPai(string id)
        {
            if (_context.Pais == null)
            {
                return NotFound();
            }

            var pai = await _context.Pais.FindAsync(id);

            if (pai == null)
            {
                return NotFound();
            }

            var paiDTO = new PaisDTO
            {
                CodigoPais = pai.CodigoPais,
                Nombre = pai.Nombre
            };

            return paiDTO;
        }

        [HttpGet("Marca/{marcaId}")]
        public async Task<ActionResult<IEnumerable<PaisDTO>>> GetPaisesByMarca(int marcaId)
        {
            if (_context.Marcas == null)
            {
                return NotFound("Marca entity set is null.");
            }

            var marca = await _context.Marcas
                                      .Include(m => m.CodigoPais)
                                      .FirstOrDefaultAsync(m => m.MarcaId == marcaId);

            if (marca == null)
            {
                return NotFound($"No se encontró la marca con id {marcaId}.");
            }

            var paisDTOs = marca.CodigoPais.Select(p => new PaisDTO
            {
                CodigoPais = p.CodigoPais,
                Nombre = p.Nombre
            }).ToList();

            return paisDTOs;
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> PutPai(string id, PaisDTO paiDTO)
        {
            var pai = await _context.Pais.FindAsync(id);

            if (pai == null)
            {
                return NotFound();
            }

            pai.CodigoPais = paiDTO.CodigoPais;
            pai.Nombre = paiDTO.Nombre;

            _context.Entry(pai).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaiExists(id))
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
        public async Task<ActionResult<PaisDTO>> PostPai(PaisDTO paiDTO)
        {
            if (_context.Pais == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Pais'  is null.");
            }

            var pai = new Pai
            {
                CodigoPais = paiDTO.CodigoPais,
                Nombre = paiDTO.Nombre
            };

            _context.Pais.Add(pai);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PaiExists(pai.CodigoPais))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPai", new { id = pai.CodigoPais }, new PaisDTO { CodigoPais = pai.CodigoPais, Nombre = pai.Nombre });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePai(string id)
        {
            if (_context.Pais == null)
            {
                return NotFound();
            }

            var pai = await _context.Pais.FindAsync(id);

            if (pai == null)
            {
                return NotFound();
            }

            _context.Pais.Remove(pai);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PaiExists(string id)
        {
            return (_context.Pais?.Any(e => e.CodigoPais == id)).GetValueOrDefault();
        }
    }
}

