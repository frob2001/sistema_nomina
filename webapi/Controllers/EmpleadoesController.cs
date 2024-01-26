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
    [Route("Empleado")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly SistemanominaContext _context;

        public EmpleadosController(SistemanominaContext context)
        {
            _context = context;
        }

        // DTO para Empleado
        public class EmpleadoDTO
        {
            public int EmpleadoId { get; set; }
            public CompaniaDTO? Compania { get; set; }
            public TipoEmpleadoDTO? TipoEmpleado { get; set; }
            public string? ApellidoPaterno { get; set; }
            public string? ApellidoMaterno { get; set; }
            public string? Nombres { get; set; }
            public string? Sexo { get; set; }
            public string? NumeroCedula { get; set; }
            public string? Direccion { get; set; }
            public string? Telefono1 { get; set; }
            public string? Telefono2 { get; set; }
            public TipoContratoDTO? TipoContrato { get; set; }
            public string? CarnetIess { get; set; }
            public OcupacionDTO? Ocupacion { get; set; }
            public NivelSalarialDTO? NivelSalarial { get; set; }
            public TipoComisionDTO? TipoComision { get; set; }
            public CentroCostoDTO? CentroCostos { get; set; }
            public DateTime? FechaNacimiento { get; set; }
            public DateTime? FechaIngreso { get; set; }
            public string? CuentaBancaria { get; set; }
            public BancoDTO? Banco { get; set; }
            public TipoCuentaDTO? TipoCuenta { get; set; }
            public decimal? Bonificacion { get; set; }
            public decimal? SueldoBase { get; set; }
            public FondoReservaDTO? FondoReserva { get; set; }
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
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = e.Compania.CompaniaId,
                        Nombre = e.Compania.Nombre
                    },
                    TipoEmpleado = new TipoEmpleadoDTO
                    {
                        TipoEmpleadoId = e.TipoEmpleado.TipoEmpleadoId,
                        Nombre = e.TipoEmpleado.Nombre
                    },
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno,
                    Nombres = e.Nombres,
                    Sexo = e.Sexo,
                    NumeroCedula = e.NumeroCedula,
                    Direccion = e.Direccion,
                    Telefono1 = e.Telefono1,
                    Telefono2 = e.Telefono2,
                    TipoContrato = new TipoContratoDTO
                    {
                        TipoContratoId = e.TipoContrato.TipoContratoId,
                        Nombre = e.TipoContrato.Nombre
                    },
                    CarnetIess = e.CarnetIess,
                    Ocupacion = new OcupacionDTO
                    {
                        OcupacionId = e.Ocupacion.OcupacionId,
                        Nombre = e.Ocupacion.Nombre
                    },
                    NivelSalarial = new NivelSalarialDTO
                    {
                        NivelSalarialId = e.NivelSalarial.NivelSalarialId,
                        Nombre = e.NivelSalarial.Nombre
                    },
                    TipoComision = new TipoComisionDTO
                    {
                        TipoComisionId = e.TipoComision.TipoComisionId,
                        Nombre = e.TipoComision.Nombre
                    },
                    CentroCostos = new CentroCostoDTO
                    {
                        CentroCostoId = e.CentroCostos.CentroCostosId,
                        Nombre = e.CentroCostos.Nombre
                    },
                    FechaNacimiento = e.FechaNacimiento,
                    FechaIngreso = e.FechaIngreso,
                    CuentaBancaria = e.CuentaBancaria,
                    Banco = new BancoDTO
                    {
                        BancoId = e.Banco.BancoId,
                        Nombre = e.Banco.Nombre
                    },
                    TipoCuenta = new TipoCuentaDTO
                    {
                        TipoCuentaId = e.TipoCuenta.TipoCuentaId,
                        Nombre = e.TipoCuenta.Nombre
                    },
                    Bonificacion = e.Bonificacion,
                    SueldoBase = e.SueldoBase,
                    FondoReserva = new FondoReservaDTO
                    {
                        FondoReservaId = e.FondoReserva.FondoReservaId,
                        Nombre = e.FondoReserva.Nombre
                    },
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
                    Compania = new CompaniaDTO
                    {
                        CompaniaId = e.Compania.CompaniaId,
                        Nombre = e.Compania.Nombre
                    },
                    TipoEmpleado = new TipoEmpleadoDTO
                    {
                        TipoEmpleadoId = e.TipoEmpleado.TipoEmpleadoId,
                        Nombre = e.TipoEmpleado.Nombre
                    },
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno,
                    Nombres = e.Nombres,
                    Sexo = e.Sexo,
                    NumeroCedula = e.NumeroCedula,
                    Direccion = e.Direccion,
                    Telefono1 = e.Telefono1,
                    Telefono2 = e.Telefono2,
                    TipoContrato = new TipoContratoDTO
                    {
                        TipoContratoId = e.TipoContrato.TipoContratoId,
                        Nombre = e.TipoContrato.Nombre
                    },
                    CarnetIess = e.CarnetIess,
                    Ocupacion = new OcupacionDTO
                    {
                        OcupacionId = e.Ocupacion.OcupacionId,
                        Nombre = e.Ocupacion.Nombre
                    },
                    NivelSalarial = new NivelSalarialDTO
                    {
                        NivelSalarialId = e.NivelSalarial.NivelSalarialId,
                        Nombre = e.NivelSalarial.Nombre
                    },
                    TipoComision = new TipoComisionDTO
                    {
                        TipoComisionId = e.TipoComision.TipoComisionId,
                        Nombre = e.TipoComision.Nombre
                    },
                    CentroCostos = new CentroCostoDTO
                    {
                        CentroCostoId = e.CentroCostos.CentroCostosId,
                        Nombre = e.CentroCostos.Nombre
                    },
                    FechaNacimiento = e.FechaNacimiento,
                    FechaIngreso = e.FechaIngreso,
                    CuentaBancaria = e.CuentaBancaria,
                    Banco = new BancoDTO
                    {
                        BancoId = e.Banco.BancoId,
                        Nombre = e.Banco.Nombre
                    },
                    TipoCuenta = new TipoCuentaDTO
                    {
                        TipoCuentaId = e.TipoCuenta.TipoCuentaId,
                        Nombre = e.TipoCuenta.Nombre
                    },
                    Bonificacion = e.Bonificacion,
                    SueldoBase = e.SueldoBase,
                    FondoReserva = new FondoReservaDTO
                    {
                        FondoReservaId = e.FondoReserva.FondoReservaId,
                        Nombre = e.FondoReserva.Nombre
                    },
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

        public class EmpleadoCreateDTO
        {
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

        // POST: api/Empleados
        [HttpPost]
        public async Task<ActionResult<Empleado>> PostEmpleado(EmpleadoCreateDTO empleadoCreateDTO)
        {
            // Validación de los datos del DTO según tus necesidades

            var empleado = new Empleado
            {
                CompaniaId = empleadoCreateDTO.CompaniaId,
                TipoEmpleadoId = empleadoCreateDTO.TipoEmpleadoId,
                ApellidoPaterno = empleadoCreateDTO.ApellidoPaterno,
                ApellidoMaterno = empleadoCreateDTO.ApellidoMaterno,
                Nombres = empleadoCreateDTO.Nombres,
                Sexo = empleadoCreateDTO.Sexo,
                NumeroCedula = empleadoCreateDTO.NumeroCedula,
                Direccion = empleadoCreateDTO.Direccion,
                Telefono1 = empleadoCreateDTO.Telefono1,
                Telefono2 = empleadoCreateDTO.Telefono2,
                TipoContratoId = empleadoCreateDTO.TipoContratoId,
                CarnetIess = empleadoCreateDTO.CarnetIess,
                OcupacionId = empleadoCreateDTO.OcupacionId,
                NivelSalarialId = empleadoCreateDTO.NivelSalarialId,
                TipoComisionId = empleadoCreateDTO.TipoComisionId,
                CentroCostosId = empleadoCreateDTO.CentroCostosId,
                FechaNacimiento = empleadoCreateDTO.FechaNacimiento,
                FechaIngreso = empleadoCreateDTO.FechaIngreso,
                CuentaBancaria = empleadoCreateDTO.CuentaBancaria,
                BancoId = empleadoCreateDTO.BancoId,
                TipoCuentaId = empleadoCreateDTO.TipoCuentaId,
                Bonificacion = empleadoCreateDTO.Bonificacion,
                SueldoBase = empleadoCreateDTO.SueldoBase,
                FondoReservaId = empleadoCreateDTO.FondoReservaId,
                Reingreso = empleadoCreateDTO.Reingreso,
                FechaReingreso = empleadoCreateDTO.FechaReingreso,
                FormaCalculo13 = empleadoCreateDTO.FormaCalculo13,
                FormaCalculo14 = empleadoCreateDTO.FormaCalculo14
            };

            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmpleado", new { id = empleado.EmpleadoId }, empleado);
        }

        // PUT: api/Empleados/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpleado(int id, EmpleadoCreateDTO empleadoUpdateDTO)
        {

            var empleado = await _context.Empleados.FindAsync(id);

            if (empleado == null)
            {
                return NotFound();
            }

            // Actualiza las propiedades del empleado según el DTO
            empleado.CompaniaId = empleadoUpdateDTO.CompaniaId;
            empleado.TipoEmpleadoId = empleadoUpdateDTO.TipoEmpleadoId;
            empleado.ApellidoPaterno = empleadoUpdateDTO.ApellidoPaterno;
            empleado.ApellidoMaterno = empleadoUpdateDTO.ApellidoMaterno;
            empleado.Nombres = empleadoUpdateDTO.Nombres;
            empleado.Sexo = empleadoUpdateDTO.Sexo;
            empleado.NumeroCedula = empleadoUpdateDTO.NumeroCedula;
            empleado.Direccion = empleadoUpdateDTO.Direccion;
            empleado.Telefono1 = empleadoUpdateDTO.Telefono1;
            empleado.Telefono2 = empleadoUpdateDTO.Telefono2;
            empleado.TipoContratoId = empleadoUpdateDTO.TipoContratoId;
            empleado.CarnetIess = empleadoUpdateDTO.CarnetIess;
            empleado.OcupacionId = empleadoUpdateDTO.OcupacionId;
            empleado.NivelSalarialId = empleadoUpdateDTO.NivelSalarialId;
            empleado.TipoComisionId = empleadoUpdateDTO.TipoComisionId;
            empleado.CentroCostosId = empleadoUpdateDTO.CentroCostosId;
            empleado.FechaNacimiento = empleadoUpdateDTO.FechaNacimiento;
            empleado.FechaIngreso = empleadoUpdateDTO.FechaIngreso;
            empleado.CuentaBancaria = empleadoUpdateDTO.CuentaBancaria;
            empleado.BancoId = empleadoUpdateDTO.BancoId;
            empleado.TipoCuentaId = empleadoUpdateDTO.TipoCuentaId;
            empleado.Bonificacion = empleadoUpdateDTO.Bonificacion;
            empleado.SueldoBase = empleadoUpdateDTO.SueldoBase;
            empleado.FondoReservaId = empleadoUpdateDTO.FondoReservaId;
            empleado.Reingreso = empleadoUpdateDTO.Reingreso;
            empleado.FechaReingreso = empleadoUpdateDTO.FechaReingreso;
            empleado.FormaCalculo13 = empleadoUpdateDTO.FormaCalculo13;
            empleado.FormaCalculo14 = empleadoUpdateDTO.FormaCalculo14;

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
