using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("Estados")]
    [ApiController]
    public class EstadoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public EstadoesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class EstadoDto
        {
            public string DescripcionEspanol { get; set; }
            public string? DescripcionIngles { get; set; }
            public string? Color { get; set; }
            public string? NombreColor { get; set; }
            public string Codigo { get; set; }
            public string? NombreTipoEstadoEspanol { get; set; }
            public string? NombreTipoEstadoIngles { get; set; }
            public TipoEstadoDTO TipoEstado { get; set; }
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoDto>>> GetEstados()
        {
            if (_context.Estados == null)
            {
                return NotFound();
            }

            var estados = await _context.Estados
            .Include(e => e.TipoEstado)
            .Select(e => new EstadoDto
            {
                Codigo = e.Codigo,
                DescripcionEspanol = e.DescripcionEspanol,
                DescripcionIngles = e.DescripcionIngles,
                Color = e.Color,
                NombreColor = e.NombreColor,
                NombreTipoEstadoEspanol = e.TipoEstado.NombreEspanol,
                NombreTipoEstadoIngles = e.TipoEstado.NombreIngles,
                TipoEstado = new TipoEstadoDTO
                {
                    TipoEstadoId = e.TipoEstadoId,
                    NombreEspanol = e.TipoEstado.NombreEspanol,
                    NombreIngles = e.TipoEstado.NombreIngles,
                    DisplayName = e.TipoEstadoId + ": " + e.TipoEstado.NombreEspanol + " / " + e.TipoEstado.NombreIngles
                }
            })
            .ToListAsync();

            return estados;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EstadoDto>> GetEstado(string id)
        {
            if (_context.Estados == null)
            {
                return NotFound();
            }

            var estado = await _context.Estados
                .Include(e => e.TipoEstado)
                .Where(e => e.Codigo == id)
                .Select(e => new EstadoDto
                {
                    Codigo = e.Codigo,
                    DescripcionEspanol = e.DescripcionEspanol,
                    DescripcionIngles = e.DescripcionIngles,
                    Color = e.Color,
                    NombreColor = e.NombreColor,
                    NombreTipoEstadoEspanol = e.TipoEstado.NombreEspanol,
                    NombreTipoEstadoIngles = e.TipoEstado.NombreIngles,
                    TipoEstado = new TipoEstadoDTO
                    {
                        TipoEstadoId = e.TipoEstadoId,
                        NombreEspanol = e.TipoEstado.NombreEspanol,
                        NombreIngles = e.TipoEstado.NombreIngles,
                        DisplayName = e.TipoEstadoId + ": " + e.TipoEstado.NombreEspanol + " / " + e.TipoEstado.NombreIngles
                    }
                })
                .FirstOrDefaultAsync();

            if (estado == null)
            {
                return NotFound();
            }

            return estado;
        }

        private string GetColorNameByHex(string hexValue)
        {
            var colorMap = new Dictionary<string, string>
            {
                ["#2D3748"] = "Negro",
                ["#E53E3E"] = "Rojo",
                ["#2F855A"] = "Verde",
                ["#2B6CB0"] = "Azul",
                ["#D69E2E"] = "Amarillo",
                ["#DD6B20"] = "Naranja",
                ["#6B46C1"] = "Púrpura",
                ["#319795"] = "Cian",
                ["#975A16"] = "Marrón",
                ["#D53F8C"] = "Rosa"
            };

            if (colorMap.TryGetValue(hexValue, out var colorName))
            {
                return colorName;
            }

            return null;
        }

        public class EstadoInputDto
        {
            public string DescripcionEspanol { get; set; } = null!;
            public string? DescripcionIngles { get; set; }
            public string? Color { get; set; }
            public string? TipoEstadoId { get; set; }
            public string Codigo { get; set; } = null!;
            public string? NombreColor { get; set; }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutEstado(string id, EstadoInputDto estadoInputDto)
        {
            if (id != estadoInputDto.Codigo)
            {
                return BadRequest();
            }

            var estado = await _context.Estados.FindAsync(id);
            if (estado == null)
            {
                return NotFound();
            }

            estado.DescripcionEspanol = estadoInputDto.DescripcionEspanol;
            estado.DescripcionIngles = estadoInputDto.DescripcionIngles;
            estado.Color = estadoInputDto.Color;
            estado.NombreColor = GetColorNameByHex(estadoInputDto.Color);
            estado.TipoEstadoId = estadoInputDto.TipoEstadoId;

            _context.Entry(estado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EstadoExists(id))
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
        public async Task<ActionResult<Estado>> PostEstado(EstadoInputDto estadoInputDto)
        {
            if (_context.Estados == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Estados' is null.");
            }

            var estado = new Estado
            {
                Codigo = estadoInputDto.Codigo,
                DescripcionEspanol = estadoInputDto.DescripcionEspanol,
                DescripcionIngles = estadoInputDto.DescripcionIngles,
                Color = estadoInputDto.Color,
                NombreColor = GetColorNameByHex(estadoInputDto.Color),
                TipoEstadoId = estadoInputDto.TipoEstadoId
            };

            _context.Estados.Add(estado);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EstadoExists(estado.Codigo))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetEstado", new { id = estado.Codigo }, estado);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstado(string id)
        {
            if (_context.Estados == null)
            {
                return NotFound();
            }
            var estado = await _context.Estados.FindAsync(id);
            if (estado == null)
            {
                return NotFound();
            }

            _context.Estados.Remove(estado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EstadoExists(string id)
        {
            return (_context.Estados?.Any(e => e.Codigo == id)).GetValueOrDefault();
        }
    }
}
