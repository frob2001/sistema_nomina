using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Estado
{
    public string DescripcionEspanol { get; set; } = null!;

    public string? DescripcionIngles { get; set; }

    public string? Color { get; set; }

    public string? TipoEstadoId { get; set; }

    public string Codigo { get; set; } = null!;

    public string? NombreColor { get; set; }

    public virtual ICollection<EstadoAccion> EstadoAccions { get; set; } = new List<EstadoAccion>();

    public virtual ICollection<EstadoInfraccion> EstadoInfraccions { get; set; } = new List<EstadoInfraccion>();

    public virtual ICollection<EstadoMarca> EstadoMarcas { get; set; } = new List<EstadoMarca>();

    public virtual ICollection<EstadoPatente> EstadoPatentes { get; set; } = new List<EstadoPatente>();

    public virtual ICollection<Evento1> Evento1s { get; set; } = new List<Evento1>();

    public virtual ICollection<Evento2> Evento2s { get; set; } = new List<Evento2>();

    public virtual ICollection<Evento3> Evento3s { get; set; } = new List<Evento3>();

    public virtual ICollection<Evento4> Evento4s { get; set; } = new List<Evento4>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();

    public virtual TipoEstado? TipoEstado { get; set; }
}
