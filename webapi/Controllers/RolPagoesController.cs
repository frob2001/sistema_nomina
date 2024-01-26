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
    [Route("RolPago")]
    [ApiController]
    public class RolPagosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public RolPagosController(SistemaNominaContext context)
        {
            _context = context;
        }

        // DTOs para RolPago
        public class RolPagoDTO
        {
            public int RolPagoId { get; set; }
            public CompaniaDTO? Compania { get; set; }
            public int? AnoGeneracion { get; set; }
            public int? MesGeneracion { get; set; }
            public UsuarioInfoDTO? Usuario { get; set; }
            public DateTime? FechaCreacion { get; set; }
        }

        // GET: api/RolPago
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolPagoDTO>>> GetRolPagos()
        {
            return await _context.RolPagos
                .Select(rp => new RolPagoDTO
                {
                    RolPagoId = rp.RolPagoId,
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = rp.Compania.CompaniaId,
                        Nombre = rp.Compania.Nombre
                    },
                    AnoGeneracion = rp.AnoGeneracion,
                    MesGeneracion = rp.MesGeneracion,
                    Usuario = new UsuarioInfoDTO
                    {
                        Nombre = rp.Usuario.Nombre,
                        CorreoElectronico = rp.Usuario.CorreoElectronico,
                        Emisor = new EmisorDTO
                        {
                            EmisorId = rp.Usuario.Emisor.EmisorId,
                            Nombre = rp.Usuario.Emisor.Nombre
                        },
                        Sucursal = new SucursalDTO
                        {
                            SucursalId = rp.Usuario.Sucursal.SucursalId,
                            Nombre = rp.Usuario.Sucursal.Nombre
                        }
                    },
                    FechaCreacion = rp.FechaCreacion
                })
                .ToListAsync();
        }

        // GET: api/RolPago/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RolPagoDTO>> GetRolPago(int id)
        {
            var rolPago = await _context.RolPagos
                .Where(rp => rp.RolPagoId == id)
                .Select(rp => new RolPagoDTO
                {
                    RolPagoId = rp.RolPagoId,
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = rp.Compania.CompaniaId,
                        Nombre = rp.Compania.Nombre
                    },
                    AnoGeneracion = rp.AnoGeneracion,
                    MesGeneracion = rp.MesGeneracion,
                    Usuario = new UsuarioInfoDTO
                    {
                        Nombre = rp.Usuario.Nombre,
                        CorreoElectronico = rp.Usuario.CorreoElectronico,
                        Emisor = new EmisorDTO
                        {
                            EmisorId = rp.Usuario.Emisor.EmisorId,
                            Nombre = rp.Usuario.Emisor.Nombre
                        },
                        Sucursal = new SucursalDTO
                        {
                            SucursalId = rp.Usuario.Sucursal.SucursalId,
                            Nombre = rp.Usuario.Sucursal.Nombre
                        }
                    },
                    FechaCreacion = rp.FechaCreacion
                })
                .FirstOrDefaultAsync();

            if (rolPago == null)
            {
                return NotFound();
            }

            return rolPago;
        }

        public class RolPagoInputDTO
        {
            public int? CompaniaId { get; set; }
            public int? AnoGeneracion { get; set; }
            public int? MesGeneracion { get; set; }
            public int? UsuarioId { get; set; }
            public DateTime? FechaCreacion { get; set; }
        }

        // POST: api/RolPago
        [HttpPost]
        public async Task<ActionResult<RolPago>> PostRolPago(RolPagoInputDTO rolPagoDto)
        {
            var rolPago = new RolPago
            {
                CompaniaId = rolPagoDto.CompaniaId,
                AnoGeneracion = rolPagoDto.AnoGeneracion,
                MesGeneracion = rolPagoDto.MesGeneracion,
                UsuarioId = rolPagoDto.UsuarioId,
                FechaCreacion = rolPagoDto.FechaCreacion
            };

            _context.RolPagos.Add(rolPago);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRolPago", new { id = rolPago.RolPagoId }, rolPago);
        }

        // PUT: api/RolPago/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRolPago(int id, RolPagoInputDTO rolPagoDto)
        {
            var rolPago = await _context.RolPagos.FindAsync(id);
            if (rolPago == null)
            {
                return NotFound();
            }

            rolPago.CompaniaId = rolPagoDto.CompaniaId;
            rolPago.AnoGeneracion = rolPagoDto.AnoGeneracion;
            rolPago.MesGeneracion = rolPagoDto.MesGeneracion;
            rolPago.UsuarioId = rolPagoDto.UsuarioId;
            rolPago.FechaCreacion = rolPagoDto.FechaCreacion;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.RolPagos.Any(rp => rp.RolPagoId == id))
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

        // DELETE: api/RolPago/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRolPago(int id)
        {
            var rolPago = await _context.RolPagos.FindAsync(id);
            if (rolPago == null)
            {
                return NotFound();
            }

            _context.RolPagos.Remove(rolPago);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RolPagoExists(int id)
        {
            return (_context.RolPagos?.Any(e => e.RolPagoId == id)).GetValueOrDefault();
        }
    }
}

