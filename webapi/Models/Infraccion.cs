using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Infraccion
{
    public int InfraccionId { get; set; }

    public int TipoInfraccionId { get; set; }

    public int OficinaTramitante { get; set; }

    public int AbogadoId { get; set; }

    public int MarcaId { get; set; }

    public string ReferenciaInterna { get; set; } = null!;

    public string Infractor { get; set; } = null!;

    public int AutoridadId { get; set; }

    public string? NumeroProceso { get; set; }

    public string? NumeroProcesoJudicial { get; set; }

    public string? CodigoDai { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public int? ClaseMarca { get; set; }

    public int? ClaseInfractor { get; set; }

    public string? CodigoPaisMarca { get; set; }

    public string? CodigoPaisInfractor { get; set; }

    public bool? Activo { get; set; }

    public virtual Abogado Abogado { get; set; } = null!;

    public virtual Autoridad Autoridad { get; set; } = null!;

    public virtual Clase? ClaseInfractorNavigation { get; set; }

    public virtual Clase? ClaseMarcaNavigation { get; set; }

    public virtual Pai? CodigoPaisInfractorNavigation { get; set; }

    public virtual Pai? CodigoPaisMarcaNavigation { get; set; }

    public virtual Marca Marca { get; set; } = null!;

    public virtual Cliente OficinaTramitanteNavigation { get; set; } = null!;

    public virtual TipoInfraccion TipoInfraccion { get; set; } = null!;

    public virtual ICollection<CasoInfraccion> CasoInfraccions { get; set; } = new List<CasoInfraccion>();

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
    public virtual ICollection<EstadoInfraccion> EstadoInfraccions { get; set; } = new List<EstadoInfraccion>();
}
