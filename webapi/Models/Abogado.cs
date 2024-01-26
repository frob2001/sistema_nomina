using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Abogado
{
    public int AbogadoId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string? Identificacion { get; set; }

    public string? Matricula { get; set; }

    public string? Email { get; set; }

    public string? Telefono { get; set; }

    public virtual ICollection<AccionTercero> AccionTerceros { get; set; } = new List<AccionTercero>();

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();

    public virtual ICollection<Propietario> Propietarios { get; set; } = new List<Propietario>();
}
