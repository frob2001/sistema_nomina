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
    [Route("MovimientosPlanilla")]
    [ApiController]
    public class MovimientosPlanillasController : ControllerBase
    {
        private readonly SistemanominaContext _context;

        public MovimientosPlanillasController(SistemanominaContext context)
        {
            _context = context;
        }


        // DTOs para MovimientosPlanilla
        public class MovimientosPlanillaDTO
        {
            public int MovimientoId { get; set; }
            public CompaniaDTO? Compania { get; set; }
            public EmpleadoDTOGeneral? Empleado { get; set; }
            public ConceptoDTO? Concepto { get; set; }
            public int? Ano { get; set; }
            public int? Mes { get; set; }
            public decimal? Importe { get; set; }
            public TipoOperacionDTO? TipoOperacion { get; set; }
        }


        // GET: api/MovimientosPlanilla
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovimientosPlanillaDTO>>> GetMovimientosPlanilla()
        {
            return await _context.MovimientosPlanillas
                .Select(m => new MovimientosPlanillaDTO
                {
                    MovimientoId = m.MovimientoId,
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = m.Compania.CompaniaId,
                        Nombre = m.Compania.Nombre
                    },
                    Empleado = new EmpleadoDTOGeneral
                    {
                        EmpleadoId = m.Empleado.EmpleadoId,
                        ApellidoMaterno = m.Empleado.ApellidoMaterno,
                        ApellidoPaterno = m.Empleado.ApellidoPaterno,
                        Nombres = m.Empleado.Nombres,
                        TipoEmpleado = new TipoEmpleadoDTO
                        {
                            TipoEmpleadoId = m.Empleado.TipoEmpleado.TipoEmpleadoId,
                            Nombre = m.Empleado.TipoEmpleado.Nombre
                        },
                        Compania = new CompaniaDTO
                        {
                            CompaniaId = m.Empleado.Compania.CompaniaId,
                            Nombre = m.Empleado.Compania.Nombre
                        }
                    },
                    Concepto = new ConceptoDTO
                    {
                        ConceptoId = m.Concepto.ConceptoId,
                        Nombre = m.Concepto.Nombre
                    },
                    Ano = m.Ano,
                    Mes = m.Mes,
                    Importe = m.Importe,
                    TipoOperacion = new TipoOperacionDTO
                    {
                        TipoOperacionId = m.TipoOperacion.TipoOperacionId,
                        Nombre = m.TipoOperacion.Nombre
                    }
                })
                .ToListAsync();
        }

        // GET: api/MovimientosPlanilla/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MovimientosPlanillaDTO>> GetMovimientoPlanilla(int id)
        {
            var movimiento = await _context.MovimientosPlanillas
                .Where(m => m.MovimientoId == id)
                .Select(m => new MovimientosPlanillaDTO
                {
                    MovimientoId = m.MovimientoId,
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = m.Compania.CompaniaId,
                        Nombre = m.Compania.Nombre
                    },
                    Empleado = new EmpleadoDTOGeneral
                    {
                        EmpleadoId = m.Empleado.EmpleadoId,
                        ApellidoMaterno = m.Empleado.ApellidoMaterno,
                        ApellidoPaterno = m.Empleado.ApellidoPaterno,
                        Nombres = m.Empleado.Nombres,
                        TipoEmpleado = new TipoEmpleadoDTO
                        {
                            TipoEmpleadoId = m.Empleado.TipoEmpleado.TipoEmpleadoId,
                            Nombre = m.Empleado.TipoEmpleado.Nombre
                        },
                        Compania = new CompaniaDTO
                        {
                            CompaniaId = m.Empleado.Compania.CompaniaId,
                            Nombre = m.Empleado.Compania.Nombre
                        }
                    },
                    Concepto = new ConceptoDTO
                    {
                        ConceptoId = m.Concepto.ConceptoId,
                        Nombre = m.Concepto.Nombre
                    },
                    Ano = m.Ano,
                    Mes = m.Mes,
                    Importe = m.Importe,
                    TipoOperacion = new TipoOperacionDTO
                    {
                        TipoOperacionId = m.TipoOperacion.TipoOperacionId,
                        Nombre = m.TipoOperacion.Nombre
                    }
                })
                .FirstOrDefaultAsync();

            if (movimiento == null)
            {
                return NotFound();
            }

            return movimiento;
        }

        public class MovimientosPlanillaInputDTO
        {
            public int? CompaniaId { get; set; }
            public int? EmpleadoId { get; set; }
            public int? ConceptoId { get; set; }
            public int? Ano { get; set; }
            public int? Mes { get; set; }
            public decimal? Importe { get; set; }
            public int? TipoOperacionId { get; set; }
        }

        // POST: api/MovimientosPlanilla
        [HttpPost]
        public async Task<ActionResult<MovimientosPlanilla>> PostMovimientoPlanilla(MovimientosPlanillaInputDTO movimientoDto)
        {
            var movimiento = new MovimientosPlanilla
            {
                CompaniaId = movimientoDto.CompaniaId,
                EmpleadoId = movimientoDto.EmpleadoId,
                ConceptoId = movimientoDto.ConceptoId,
                Ano = movimientoDto.Ano,
                Mes = movimientoDto.Mes,
                Importe = movimientoDto.Importe,
                TipoOperacionId = movimientoDto.TipoOperacionId
            };

            _context.MovimientosPlanillas.Add(movimiento);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMovimientoPlanilla", new { id = movimiento.MovimientoId }, movimiento);
        }

        // PUT: api/MovimientosPlanilla/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMovimientoPlanilla(int id, MovimientosPlanillaInputDTO movimientoDto)
        {

            var movimiento = await _context.MovimientosPlanillas.FindAsync(id);
            if (movimiento == null)
            {
                return NotFound();
            }

            movimiento.CompaniaId = movimientoDto.CompaniaId;
            movimiento.EmpleadoId = movimientoDto.EmpleadoId;
            movimiento.ConceptoId = movimientoDto.ConceptoId;
            movimiento.Ano = movimientoDto.Ano;
            movimiento.Mes = movimientoDto.Mes;
            movimiento.Importe = movimientoDto.Importe;
            movimiento.TipoOperacionId = movimientoDto.TipoOperacionId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.MovimientosPlanillas.Any(m => m.MovimientoId == id))
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

        // DELETE: api/MovimientosPlanilla/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovimientoPlanilla(int id)
        {
            var movimiento = await _context.MovimientosPlanillas.FindAsync(id);
            if (movimiento == null)
            {
                return NotFound();
            }

            _context.MovimientosPlanillas.Remove(movimiento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovimientosPlanillaExists(int id)
        {
            return (_context.MovimientosPlanillas?.Any(e => e.MovimientoId == id)).GetValueOrDefault();
        }
    }
}
