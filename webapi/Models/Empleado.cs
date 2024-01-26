using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Empleado
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

    public virtual Banco? Banco { get; set; }

    public virtual CentroCosto? CentroCostos { get; set; }

    public virtual Companium? Compania { get; set; }

    public virtual FondoReserva? FondoReserva { get; set; }

    public virtual ICollection<MovimientosPlanilla> MovimientosPlanillas { get; set; } = new List<MovimientosPlanilla>();

    public virtual NivelSalarial? NivelSalarial { get; set; }

    public virtual Ocupacion? Ocupacion { get; set; }

    public virtual TipoComision? TipoComision { get; set; }

    public virtual TipoContrato? TipoContrato { get; set; }

    public virtual TipoCuentum? TipoCuenta { get; set; }

    public virtual TipoEmpleado? TipoEmpleado { get; set; }
}
