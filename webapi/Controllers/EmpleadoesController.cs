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
    [Route("api/Empleados")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public EmpleadosController(SistemaNominaContext context)
        {
            _context = context;
        }

        // DTO para Empleado
        public class EmpleadoDTO
        {
            public int EmpleadoId { get; set; }
            public int? CompaniaId { get; set; }
            public int? TipoEmpleadoId { get; set; }
            public string? ApellidoPaterno { get; set; }
            public string? ApellidoMaterno { get; set; }
            public string? Nombres { get; set; }
            public string? Sexo { get; set; }
            public string? NumeroCedula { get; set; }
            public string? Direccion { get; set; }
            public string? Telefono1 { get; set; }
            public string? Telefono2 { get; set; }
            public int? TipoContratoId { get; set; }
            public string? CarnetIess { get; set; }
            public int? OcupacionId { get; set; }
            public int? NivelSalarialId { get; set; }
            public int? TipoComisionId { get; set; }
            public int? CentroCostosId { get; set; }
            public DateTime? FechaNacimiento { get; set; }
            public DateTime? FechaIngreso { get; set; }
            public string? CuentaBancaria { get; set; }
            public int? BancoId { get; set; }
            public int? TipoCuentaId { get; set; }
            public decimal? Bonificacion { get; set; }
            public decimal? SueldoBase { get; set; }
            public int? FondoReservaId { get; set; }
            public bool? Reingreso { get; set; }
            public DateTime? FechaReingreso { get; set; }
            public string? FormaCalculo13 { get; set; }
            public string? FormaCalculo14 { get; set; }
        }

        // GET: api/Empleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpleadoDTO>>> GetEmpleados()
        {
            var empleados = await _context.Empleados
                .Select(e => new EmpleadoDTO
                {
                    EmpleadoId = e.EmpleadoId,
                    CompaniaId = e.CompaniaId,
                    TipoEmpleadoId = e.TipoEmpleadoId,
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno,
                    Nombres = e.Nombres,
                    Sexo = e.Sexo,
                    NumeroCedula = e.NumeroCedula,
                    Direccion = e.Direccion,
                    Telefono1 = e.Telefono1,
                    Telefono2 = e.Telefono2,
                    TipoContratoId = e.TipoContratoId,
                    CarnetIess = e.CarnetIess,
                    OcupacionId = e.OcupacionId,
                    NivelSalarialId = e.NivelSalarialId,
                    TipoComisionId = e.TipoComisionId,
                    CentroCostosId = e.CentroCostosId,
                    FechaNacimiento = e.FechaNacimiento,
                    FechaIngreso = e.FechaIngreso,
                    CuentaBancaria = e.CuentaBancaria,
                    BancoId = e.BancoId,
                    TipoCuentaId = e.TipoCuentaId,
                    Bonificacion = e.Bonificacion,
                    SueldoBase = e.SueldoBase,
                    FondoReservaId = e.FondoReservaId,
                    Reingreso = e.Reingreso,
                    FechaReingreso = e.FechaReingreso,
                    FormaCalculo13 = e.FormaCalculo13,
                    FormaCalculo14 = e.FormaCalculo14
                })
                .ToListAsync();

            return empleados;
        }

        // GET: api/Empleados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpleadoDTO>> GetEmpleado(int id)
        {
            var empleado = await _context.Empleados
                .Where(e => e.EmpleadoId == id)
                .Select(e => new EmpleadoDTO
                {
                    EmpleadoId = e.EmpleadoId,
                    CompaniaId = e.CompaniaId,
                    TipoEmpleadoId = e.TipoEmpleadoId,
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno,
                    Nombres = e.Nombres,
                    Sexo = e.Sexo,
                    NumeroCedula = e.NumeroCedula,
                    Direccion = e.Direccion,
                    Telefono1 = e.Telefono1,
                    Telefono2 = e.Telefono2,
                    TipoContratoId = e.TipoContratoId,
                    CarnetIess = e.CarnetIess,
                    OcupacionId = e.OcupacionId,
                    NivelSalarialId = e.NivelSalarialId,
                    TipoComisionId = e.TipoComisionId,
                    CentroCostosId = e.CentroCostosId,
                    FechaNacimiento = e.FechaNacimiento,
                    FechaIngreso = e.FechaIngreso,
                    CuentaBancaria = e.CuentaBancaria,
                    BancoId = e.BancoId,
                    TipoCuentaId = e.TipoCuentaId,
                    Bonificacion = e.Bonificacion,
                    SueldoBase = e.SueldoBase,
                    FondoReservaId = e.FondoReservaId,
                    Reingreso = e.Reingreso,
                    FechaReingreso = e.FechaReingreso,
                    FormaCalculo13 = e.FormaCalculo13,
                    FormaCalculo14 = e.FormaCalculo14
                })
                .FirstOrDefaultAsync();

            if (empleado == null)
            {
                return NotFound();
            }

            return empleado;
        }

        // POST: api/Empleados
        [HttpPost]
        public async Task<ActionResult<EmpleadoDTO>> PostEmpleado(EmpleadoDTO empleadoDTO)
        {
            // Validación de los datos del DTO según tus necesidades

            var empleado = new Empleado
            {
                CompaniaId = empleadoDTO.CompaniaId,
                TipoEmpleadoId = empleadoDTO.TipoEmpleadoId,
                ApellidoPaterno = empleadoDTO.ApellidoPaterno,
                ApellidoMaterno = empleadoDTO.ApellidoMaterno,
                Nombres = empleadoDTO.Nombres,
                Sexo = empleadoDTO.Sexo,
                NumeroCedula = empleadoDTO.NumeroCedula,
                Direccion = empleadoDTO.Direccion,
                Telefono1 = empleadoDTO.Telefono1,
                Telefono2 = empleadoDTO.Telefono2,
                TipoContratoId = empleadoDTO.TipoContratoId,
                CarnetIess = empleadoDTO.CarnetIess,
                OcupacionId = empleadoDTO.OcupacionId,
                NivelSalarialId = empleadoDTO.NivelSalarialId,
                TipoComisionId = empleadoDTO.TipoComisionId,
                CentroCostosId = empleadoDTO.CentroCostosId,
                FechaNacimiento = empleadoDTO.FechaNacimiento,
                FechaIngreso = empleadoDTO.FechaIngreso,
                CuentaBancaria = empleadoDTO.CuentaBancaria,
                BancoId = empleadoDTO.BancoId,
                TipoCuentaId = empleadoDTO.TipoCuentaId,
                Bonificacion = empleadoDTO.Bonificacion,
                SueldoBase = empleadoDTO.SueldoBase,
                FondoReservaId = empleadoDTO.FondoReservaId,
                Reingreso = empleadoDTO.Reingreso,
                FechaReingreso = empleadoDTO.FechaReingreso,
                FormaCalculo13 = empleadoDTO.FormaCalculo13,
                FormaCalculo14 = empleadoDTO.FormaCalculo14
            };

            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmpleado", new { id = empleado.EmpleadoId }, empleadoDTO);
        }

        // PUT: api/Empleados/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpleado(int id, EmpleadoDTO empleadoDTO)
        {
            if (id != empleadoDTO.EmpleadoId)
            {
                return BadRequest();
            }

            var empleado = await _context.Empleados.FindAsync(id);

            if (empleado == null)
            {
                return NotFound();
            }

            // Actualiza las propiedades del empleado según el DTO
            empleado.CompaniaId = empleadoDTO.CompaniaId;
            empleado.TipoEmpleadoId = empleadoDTO.TipoEmpleadoId;
            empleado.ApellidoPaterno = empleadoDTO.ApellidoPaterno;
            empleado.ApellidoMaterno = empleadoDTO.ApellidoMaterno;
            empleado.Nombres = empleadoDTO.Nombres;
            empleado.Sexo = empleadoDTO.Sexo;
            empleado.NumeroCedula = empleadoDTO.NumeroCedula;
            empleado.Direccion = empleadoDTO.Direccion;
            empleado.Telefono1 = empleadoDTO.Telefono1;
            empleado.Telefono2 = empleadoDTO.Telefono2;
            empleado.TipoContratoId = empleadoDTO.TipoContratoId;
            empleado.CarnetIess = empleadoDTO.CarnetIess;
            empleado.OcupacionId = empleadoDTO.OcupacionId;
            empleado.NivelSalarialId = empleadoDTO.NivelSalarialId;
            empleado.TipoComisionId = empleadoDTO.TipoComisionId;
            empleado.CentroCostosId = empleadoDTO.CentroCostosId;
            empleado.FechaNacimiento = empleadoDTO.FechaNacimiento;
            empleado.FechaIngreso = empleadoDTO.FechaIngreso;
            empleado.CuentaBancaria = empleadoDTO.CuentaBancaria;
            empleado.BancoId = empleadoDTO.BancoId;
            empleado.TipoCuentaId = empleadoDTO.TipoCuentaId;
            empleado.Bonificacion = empleadoDTO.Bonificacion;
            empleado.SueldoBase = empleadoDTO.SueldoBase;
            empleado.FondoReservaId = empleadoDTO.FondoReservaId;
            empleado.Reingreso = empleadoDTO.Reingreso;
            empleado.FechaReingreso = empleadoDTO.FechaReingreso;
            empleado.FormaCalculo13 = empleadoDTO.FormaCalculo13;
            empleado.FormaCalculo14 = empleadoDTO.FormaCalculo14;

            _context.Entry(empleado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpleadoExists(id))
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

        // DELETE: api/Empleados/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            var empleado = await _context.Empleados.FindAsync(id);

            if (empleado == null)
            {
                return NotFound();
            }

            _context.Empleados.Remove(empleado);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool EmpleadoExists(int id)
        {
            return _context.Empleados.Any(e => e.EmpleadoId == id);
        }
    }
}
