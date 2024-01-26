using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Propietario
{
    public int PropietarioId { get; set; }

    public string Nombre { get; set; } = null!;

    public string? CodigoPais { get; set; }

    public string? NumeroPoder { get; set; }

    public DateTime? FechaPoder { get; set; }

    public string? Origen { get; set; }

    public string? Notas { get; set; }

    public bool? General { get; set; }

    public virtual Pai? CodigoPaisNavigation { get; set; }

    public virtual ICollection<GrupoDosEvento4> GrupoDosEvento4s { get; set; } = new List<GrupoDosEvento4>();

    public virtual ICollection<GrupoUnoEvento4> GrupoUnoEvento4s { get; set; } = new List<GrupoUnoEvento4>();

    public virtual ICollection<MarcaBase> MarcaBases { get; set; } = new List<MarcaBase>();

    public virtual ICollection<Abogado> Abogados { get; set; } = new List<Abogado>();

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();
}
