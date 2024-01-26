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
    [Route("Fabricantes")]
    [ApiController]
    public class RegulatorioFabricantesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public RegulatorioFabricantesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        // GET: api/RegulatorioFabricantes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegulatorioFabricanteDTO>>> GetRegulatorioFabricantes()
        {
            return await _context.RegulatorioFabricantes
                .Select(r => new RegulatorioFabricanteDTO
                {
                    RegulatorioFabricanteId = r.RegulatorioFabricanteId,
                    RegulatorioId = r.RegulatorioId,
                    Nombre = r.Nombre,
                    CodigoPais = r.CodigoPais,
                    Ciudad = r.Ciudad
                })
                .ToListAsync();
        }

        // GET: api/RegulatorioFabricantes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RegulatorioFabricanteDTO>> GetRegulatorioFabricante(int id)
        {
            var regulatorioFabricante = await _context.RegulatorioFabricantes
                .Select(r => new RegulatorioFabricanteDTO
                {
                    RegulatorioFabricanteId = r.RegulatorioFabricanteId,
                    RegulatorioId = r.RegulatorioId,
                    Nombre = r.Nombre,
                    CodigoPais = r.CodigoPais,
                    Ciudad = r.Ciudad
                })
                .FirstOrDefaultAsync(r => r.RegulatorioFabricanteId == id);

            if (regulatorioFabricante == null)
            {
                return NotFound();
            }

            return regulatorioFabricante;
        }


        public class RegulatorioFabricanteInputDTO
        {
            public int RegulatorioFabricanteId { get; set; }
            public int? RegulatorioId { get; set; }
            public string Nombre { get; set; } = null!;
            public string CodigoPais { get; set; } = null!;
            public string Ciudad { get; set; } = null!;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRegulatorioFabricantes(int id, RegulatorioFabricanteInputDTO regulatorioFabricanteInputDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var regulatorioFabricantes = await _context.RegulatorioFabricantes.FindAsync(id);
            if (regulatorioFabricantes == null)
            {
                return NotFound();
            }

            regulatorioFabricantes.RegulatorioFabricanteId = regulatorioFabricanteInputDTO.RegulatorioFabricanteId;
            regulatorioFabricantes.RegulatorioId = regulatorioFabricanteInputDTO.RegulatorioId;
            regulatorioFabricantes.Nombre = regulatorioFabricanteInputDTO.Nombre;
            regulatorioFabricantes.CodigoPais = regulatorioFabricanteInputDTO.CodigoPais;
            regulatorioFabricantes.Ciudad = regulatorioFabricanteInputDTO.Ciudad;

            _context.Entry(regulatorioFabricantes).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegulatorioFabricanteExists(id))
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
        public async Task<ActionResult<RegulatorioFabricante>> PostRegulatorioFabricantes(RegulatorioFabricanteInputDTO RegulatorioFabricanteInputDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var regulatorioFabricantes = new RegulatorioFabricante
            {
                RegulatorioFabricanteId = RegulatorioFabricanteInputDTO.RegulatorioFabricanteId,
                RegulatorioId = RegulatorioFabricanteInputDTO.RegulatorioId,
                Nombre = RegulatorioFabricanteInputDTO.Nombre,
                CodigoPais = RegulatorioFabricanteInputDTO.CodigoPais,
                Ciudad = RegulatorioFabricanteInputDTO.Ciudad
            };

            _context.RegulatorioFabricantes.Add(regulatorioFabricantes);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRegulatorioFabricantes", new { id = regulatorioFabricantes.RegulatorioFabricanteId }, regulatorioFabricantes);
        }

        // DELETE: api/RegulatorioFabricantes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegulatorioFabricante(int id)
        {
            if (_context.RegulatorioFabricantes == null)
            {
                return NotFound();
            }
            var regulatorioFabricante = await _context.RegulatorioFabricantes.FindAsync(id);
            if (regulatorioFabricante == null)
            {
                return NotFound();
            }

            _context.RegulatorioFabricantes.Remove(regulatorioFabricante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RegulatorioFabricanteExists(int id)
        {
            return (_context.RegulatorioFabricantes?.Any(e => e.RegulatorioFabricanteId == id)).GetValueOrDefault();
        }
    }
}
