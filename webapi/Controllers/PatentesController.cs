using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using Azure.Storage.Blobs;

namespace webapi.Controllers
{
    [Route("Patentes")]
    [ApiController]
    public class PatentesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;
        public PatentesController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }
        public class TipoPatenteDropDownDTO
        {
            public int TipoPatenteId { get; set; }
            public string? Nombre { get; set; }
        }

        public class InventoresPatentesDTO
        {
            public int InventorId { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
        }

        public class PagosPatenteDTO
        {
            public DateTime Fecha { get; set; }
            public string? Descripcion { get; set; }
            public string? UsuarioId { get; set; }
        }

        public class PrioridadPatenteDTO
        {
            public int PrioridadPatenteId { get; set; }
            public string CodigoPais { get; set; } = null!;
            public string Numero { get; set; } = null!;
            public DateTime Fecha { get; set; }
        }


        public class PublicacionPatenteDTO
        {
            public int PublicacionPatenteId { get; set; }
            public int TipoPublicacionId { get; set; }
            public int NumeroGaceta { get; set; }
            public string Pagina { get; set; } = null!;
        }


        public class PatenteDTO
        {
            public int PatenteId { get; set; }
            public TipoPatenteDropDownDTO? TipoPatente { get; set; }
            public ClienteDropDownDTO? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public OficinaTramitanteDTO? OficinaTramitante { get; set; }
            public ResponsableDTO? Abogado { get; set; }
            public string? AbogadoInternacional { get; set; }
            public PaisDTO? Pais { get; set; }
            public string? TituloEspanol { get; set; }
            public string? TituloIngles { get; set; }
            public string? Resumen { get; set; }
            public List<InventoresPatentesDTO>? Inventores { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string? ReferenciaInterna { get; set; }
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public string? Caja { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Publicacion { get; set; }
            public DateTime? FechaPublicacion { get; set; }
            public string? Certificado { get; set; }
            public DateTime? Vencimiento { get; set; }
            public string? PctSolicitud { get; set; }
            public DateTime? FechaPctSolicitud { get; set; }
            public string? PctPublicacion { get; set; }
            public DateTime? FechaPctPublicacion { get; set; }
            public List<PagosPatenteDTO>? PagosPatente { get; set; }
            public bool? PagoAnualidad { get; set; }
            public DateTime? PagoAnualidadDesde { get; set; }
            public DateTime? PagoAnualidadHasta { get; set; }
            public List<PrioridadPatenteDTO>? PrioridadPatente { get; set; }
            public List<PublicacionPatenteDTO>? Publicaciones { get; set; }
        }


        public class PatenteGeneralDTO
        {
            public int PatenteId { get; set; }
            public string? TipoPatente { get; set; }
            public string? Cliente { get; set; }
            public List<ContactoDTO>? Contactos { get; set; }
            public string? OficinaTramitante { get; set; }
            public string? Abogado { get; set; }
            public string? Pais { get; set; }
            public string? TituloEspanol { get; set; }
            public string? TituloIngles { get; set; }
            public List<SolicitantesDTO>? Solicitantes { get; set; }
            public string? ReferenciaInterna { get; set; }
            public List<ReferenciaDTO>? Referencias { get; set; }
            public List<EstadosDTO>? Estados { get; set; }
            public string? Caja { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string? Publicacion { get; set; }
            public DateTime? FechaPublicacion { get; set; }
            public string? Certificado { get; set; }
            public DateTime? Vencimiento { get; set; }
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<PatenteGeneralDTO>>> SearchPatentes(
              int? patenteId,
              int? tipoPatenteId,
              int? clienteId,
              string? contacto,
              string? inventor,
              int? oficinaTramitanteId,
              int? abogadoId,
              string? abogadoInternacional,
              string? codigoPais,
              string? estadoId,
              string? tituloEspanol,
              string? tituloIngles,
              string? referencia,
              string? registro,
              string? publicacion,
              string? certificado,
              string? pctSolicitud,
              string? pctPublicacion,
              bool? pagoAnualidad,
              string? numeroPrioridad,
              int? numeroGaceta,
              int? tipoPublicacionId,
              DateTime? fechaRegistroDesde,
              DateTime? fechaRegistroHasta,
              DateTime? fechaPublicacionSolicitudDesde,
              DateTime? fechaPublicacionSolicitudHasta,
              DateTime? fechaPrioridadDesde,
              DateTime? fechaPrioridadHasta,
              DateTime? vencimientoDesde,
              DateTime? vencimientoHasta,
              DateTime? fechaPctSolicitudDesde,
              DateTime? fechaPctSolicitudHasta,
              DateTime? fechaPctPublicacionDesde,
              DateTime? fechaPctPublicacionHasta,
              DateTime? pagoAnualidadDesde,
              DateTime? pagoAnualidadHasta,
              DateTime? fechaPublicacionDesde,
              DateTime? fechaPublicacionHasta)
        {
            if (_context.Patentes == null)
            {
                return NotFound();
            }

            var query = _context.Patentes.AsQueryable();

            if (!string.IsNullOrEmpty(patenteId.ToString()))
            {
                query = query.Where(p => p.PatenteId.ToString().Contains(patenteId.ToString()));
            }
            if (tipoPatenteId.HasValue)
            {
                query = query.Where(p => p.TipoPatenteId == tipoPatenteId.Value);
            }
            if (clienteId.HasValue)
            {
                query = query.Where(p => p.ClienteId == clienteId.Value);
            }
            if (!string.IsNullOrEmpty(contacto))
            {
                query = query.Where(p => p.Contactos.Any(c => c.Nombre.Contains(contacto) || c.Apellido.Contains(contacto)));
            }
            if (!string.IsNullOrEmpty(inventor))
            {
                if (int.TryParse(inventor, out int inventorId))
                {
                    query = query.Where(p => p.Inventors.Any(i => i.InventorId == inventorId));
                }
                else
                {
                    query = query.Where(p => p.Inventors.Any(i => i.Nombre.Contains(inventor) || i.Apellido.Contains(inventor)));
                }
            }
            if (oficinaTramitanteId.HasValue)
            {
                query = query.Where(p => p.OficinaTramitante == oficinaTramitanteId.Value);
            }
            if (abogadoId.HasValue)
            {
                query = query.Where(p => p.Abogado == abogadoId.Value);
            }
            if (!string.IsNullOrEmpty(abogadoInternacional))
            {
                query = query.Where(p => p.AbogadoInternacional.Contains(abogadoInternacional));
            }
            if (!string.IsNullOrEmpty(codigoPais))
            {
                query = query.Where(p => p.CodigoPais.Contains(codigoPais));
            }
            if (!string.IsNullOrEmpty(estadoId))
            {
                query = query.Where(p => p.EstadoPatentes.Any(e => e.Estado.Codigo == estadoId));
            }
            if (!string.IsNullOrEmpty(tituloEspanol))
            {
                query = query.Where(p => p.TituloEspanol.Contains(tituloEspanol));
            }
            if (!string.IsNullOrEmpty(tituloIngles))
            {
                query = query.Where(p => p.TituloIngles.Contains(tituloIngles));
            }
            if (!string.IsNullOrEmpty(referencia))
            {
                query = query.Where(p => p.ReferenciaInterna.Contains(referencia) ||
                                         p.Referencia.Any(r => r.Referencia.Contains(referencia)));
            }
            if (!string.IsNullOrEmpty(registro))
            {
                query = query.Where(p => p.Registro.Contains(registro));
            }
            if (!string.IsNullOrEmpty(publicacion))
            {
                query = query.Where(p => p.Publicacion.Contains(publicacion));
            }
            if (!string.IsNullOrEmpty(certificado))
            {
                query = query.Where(p => p.Certificado.Contains(certificado));
            }
            if (!string.IsNullOrEmpty(pctSolicitud))
            {
                query = query.Where(p => p.PctSolicitud.Contains(pctSolicitud));
            }
            if (!string.IsNullOrEmpty(pctPublicacion))
            {
                query = query.Where(p => p.PctPublicacion.Contains(pctPublicacion));
            }
            if (pagoAnualidad.HasValue)
            {
                query = query.Where(p => p.PagoAnualidad == pagoAnualidad.Value);
            }
            if (fechaRegistroDesde.HasValue)
            {
                query = query.Where(p => p.FechaRegistro >= fechaRegistroDesde.Value);
            }
            if (fechaRegistroHasta.HasValue)
            {
                query = query.Where(p => p.FechaRegistro <= fechaRegistroHasta.Value);
            }
            if (fechaPublicacionSolicitudDesde.HasValue)
            {
                query = query.Where(p => p.FechaPublicacion >= fechaPublicacionSolicitudDesde.Value);
            }
            if (fechaPublicacionSolicitudHasta.HasValue)
            {
                query = query.Where(p => p.FechaPublicacion <= fechaPublicacionSolicitudHasta.Value);
            }
            if (vencimientoDesde.HasValue)
            {
                query = query.Where(p => p.Vencimiento >= vencimientoDesde.Value);
            }
            if (vencimientoHasta.HasValue)
            {
                query = query.Where(p => p.Vencimiento <= vencimientoHasta.Value);
            }
            if (fechaPctSolicitudDesde.HasValue)
            {
                query = query.Where(p => p.FechaPctSolicitud >= fechaPctSolicitudDesde.Value);
            }
            if (fechaPctSolicitudHasta.HasValue)
            {
                query = query.Where(p => p.FechaPctSolicitud <= fechaPctSolicitudHasta.Value);
            }
            if (fechaPctPublicacionDesde.HasValue)
            {
                query = query.Where(p => p.FechaPctPublicacion >= fechaPctPublicacionDesde.Value);
            }
            if (fechaPctPublicacionHasta.HasValue)
            {
                query = query.Where(p => p.FechaPctPublicacion <= fechaPctPublicacionHasta.Value);
            }
            if (pagoAnualidadDesde.HasValue)
            {
                query = query.Where(p => p.PagoAnualidadDesde >= pagoAnualidadDesde.Value);
            }
            if (pagoAnualidadHasta.HasValue)
            {
                query = query.Where(p => p.PagoAnualidadHasta <= pagoAnualidadHasta.Value);
            }

            if (!string.IsNullOrEmpty(numeroPrioridad))
            {
                query = query.Where(p => p.PrioridadPatentes.Any(c => c.Numero.Contains(numeroPrioridad)));
            }
            if (fechaPrioridadDesde.HasValue)
            {
                query = query.Where(p => p.PrioridadPatentes.Any(c => c.Fecha >= fechaPrioridadDesde.Value));
            }
            if (fechaPrioridadHasta.HasValue)
            {
                query = query.Where(p => p.PrioridadPatentes.Any(c => c.Fecha <= fechaPrioridadHasta.Value));
            }
            if (numeroGaceta.HasValue)
            {
                query = query.Where(p => p.PublicacionPatentes.Any(p => p.NumeroGacetaNavigation.Numero == numeroGaceta));
            }
            if (fechaPublicacionDesde.HasValue)
            {
                query = query.Where(p => p.PublicacionPatentes.Any(p => p.NumeroGacetaNavigation.Fecha >= fechaPublicacionDesde.Value));
            }
            if (fechaPublicacionHasta.HasValue)
            {
                query = query.Where(p => p.PublicacionPatentes.Any(p => p.NumeroGacetaNavigation.Fecha <= fechaPublicacionHasta.Value));
            }
            if (tipoPublicacionId.HasValue)
            {
                query = query.Where(p => p.PublicacionPatentes.Any(p => p.TipoPublicacionId == tipoPublicacionId));
            }
            query = query
                .Include(p => p.TipoPatente)
                .Include(p => p.Cliente)
                .Include(p => p.Contactos)
                .Include(p => p.OficinaTramitanteNavigation)
                .Include(p => p.AbogadoNavigation)
                .Include(p => p.CodigoPaisNavigation)
                .Include(p => p.Inventors)
                .Include(p => p.Propietarios)
                .Include(p => p.EstadoPatentes)
                    .ThenInclude(ep => ep.Estado)
                .Include(p => p.PrioridadPatentes)
                .Include(p => p.PagosPatentes)
                .Include(p => p.Referencia);

            var patentes = await query
                .Select(p => new PatenteGeneralDTO
                {
                    PatenteId = p.PatenteId,
                    TipoPatente = p.TipoPatente.Nombre,
                    Cliente = p.Cliente.CodigoPaisNavigation.Nombre + ": " + p.Cliente.ClienteId + " " + p.Cliente.Nombre,
                    Contactos = p.Contactos.Select(i => new ContactoDTO
                    {
                        ContactoId = i.ContactoId,
                        ClienteId = i.ClienteId,
                        TipoContactoClienteId = i.TipoContactoClienteId,
                        Nombre = i.Nombre,
                        Apellido = i.Apellido,
                        Email = i.Email,
                        Telefono = i.Telefono,
                        Cargo = i.Cargo,
                        CodigoIdioma = i.CodigoIdioma
                    }).ToList(),
                    OficinaTramitante = p.OficinaTramitanteNavigation.Nombre,
                    Abogado = p.AbogadoNavigation.Nombre + " " + p.AbogadoNavigation.Apellido,
                    Pais = p.CodigoPaisNavigation.Nombre,
                    TituloEspanol = p.TituloEspanol,
                    TituloIngles = p.TituloIngles,
                    Solicitantes = p.Propietarios.Select(i => new SolicitantesDTO
                    {
                        PropietarioId = i.PropietarioId,
                        Nombre = i.Nombre
                    }).ToList(),
                    ReferenciaInterna = p.ReferenciaInterna,
                    Referencias = p.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    Estados = p.EstadoPatentes.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    Caja = p.Caja,
                    Registro = p.Registro,
                    FechaRegistro = p.FechaRegistro,
                    Publicacion = p.Publicacion,
                    FechaPublicacion = p.FechaPublicacion,
                    Certificado = p.Certificado,
                    Vencimiento = p.Vencimiento
                })
                .ToListAsync();

            return patentes;
        }

        // GET: Patentes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PatenteDTO>> GetPatente(int id)
        {
            if (_context.Patentes == null)
            {
                return NotFound();
            }

            var patente = await _context.Patentes
                .Where(p => p.PatenteId == id)
                .Include(p => p.TipoPatente)
                .Include(p => p.Cliente)
                .Include(p => p.Contactos)
                .Include(p => p.OficinaTramitanteNavigation)
                .Include(p => p.AbogadoNavigation)
                .Include(p => p.CodigoPaisNavigation)
                .Include(p => p.Inventors)
                .Include(p => p.Propietarios)
                .Include(p => p.EstadoPatentes)
                    .ThenInclude(ep => ep.Estado)
                .Include(p => p.PublicacionPatentes)
                .Include(p => p.Referencia)
                .Select(p => new PatenteDTO
                {
                    PatenteId = p.PatenteId,
                    TipoPatente = new TipoPatenteDropDownDTO
                    {
                        TipoPatenteId = p.TipoPatente.TipoPatenteId,
                        Nombre = p.TipoPatente.Nombre
                    },
                    Cliente = new ClienteDropDownDTO
                    {
                        ClienteId = p.ClienteId,
                        Nombre = p.Cliente.Nombre,
                    },
                    Contactos = p.Contactos.Select(i => new ContactoDTO
                    {
                        ContactoId = i.ContactoId,
                        ClienteId = i.ClienteId,
                        TipoContactoClienteId = i.TipoContactoClienteId,
                        Nombre = i.Nombre,
                        Apellido = i.Apellido,
                        Email = i.Email,
                        Telefono = i.Telefono,
                        Cargo = i.Cargo,
                        CodigoIdioma = i.CodigoIdioma
                    }).ToList(),
                    OficinaTramitante = new OficinaTramitanteDTO
                    {
                        ClienteId = p.OficinaTramitanteNavigation.ClienteId,
                        Nombre = p.OficinaTramitanteNavigation.Nombre,
                    },
                    Abogado = new ResponsableDTO
                    {
                        AbogadoId = p.AbogadoNavigation.AbogadoId,
                        Nombre = p.AbogadoNavigation.Nombre,
                        Apellido = p.AbogadoNavigation.Apellido
                    },
                    AbogadoInternacional = p.AbogadoInternacional,
                    Pais = new PaisDTO
                    {
                        CodigoPais = p.CodigoPaisNavigation.CodigoPais,
                        Nombre = p.CodigoPaisNavigation.Nombre
                    },
                    TituloEspanol = p.TituloEspanol,
                    TituloIngles = p.TituloIngles,
                    Resumen = p.Resumen,
                    Inventores = p.Inventors.Select(i => new InventoresPatentesDTO
                    {
                        InventorId = i.InventorId,
                        Nombre = i.Nombre,
                        Apellido = i.Apellido
                    }).ToList(),
                    Solicitantes = p.Propietarios.Select(i => new SolicitantesDTO
                    {
                        PropietarioId = i.PropietarioId,
                        Nombre = i.Nombre
                    }).ToList(),
                    ReferenciaInterna = p.ReferenciaInterna,
                    Referencias = p.Referencia.Select(r => new ReferenciaDTO
                    {
                        ReferenciaId = r.ReferenciaId,
                        TipoReferenciaId = r.TipoReferenciaId,
                        TipoReferencia = r.TipoReferencia.Nombre,
                        Referencia = r.Referencia
                    }).ToList(),
                    Estados = p.EstadoPatentes.Select(ep => new EstadosDTO
                    {
                        Codigo = ep.Estado.Codigo,
                        DescripcionEspanol = ep.Estado.DescripcionEspanol,
                        DescripcionIngles = ep.Estado.DescripcionIngles,
                        Color = ep.Estado.Color
                    }).ToList(),
                    PrioridadPatente = p.PrioridadPatentes.Select(ppr => new PrioridadPatenteDTO
                    {
                        PrioridadPatenteId = ppr.PrioridadPatenteId,
                        CodigoPais = ppr.CodigoPais,
                        Numero = ppr.Numero,
                        Fecha = ppr.Fecha
                    }).ToList(),
                    Publicaciones = p.PublicacionPatentes.Select(pup => new PublicacionPatenteDTO
                    {
                        PublicacionPatenteId = pup.PublicacionPatenteId,
                        TipoPublicacionId = pup.TipoPublicacionId,
                        NumeroGaceta = pup.NumeroGaceta,
                        Pagina = pup.Pagina
                    }).ToList(),
                    Registro = p.Registro,
                    FechaRegistro = p.FechaRegistro,
                    Publicacion = p.Publicacion,
                    FechaPublicacion = p.FechaPublicacion,
                    Caja = p.Caja,
                    Certificado = p.Certificado,
                    Vencimiento = p.Vencimiento,
                    PctSolicitud = p.PctSolicitud,
                    FechaPctSolicitud = p.FechaPctSolicitud,
                    PctPublicacion = p.PctPublicacion,
                    FechaPctPublicacion = p.FechaPctPublicacion,
                    PagoAnualidad = p.PagoAnualidad,
                    PagosPatente = p.PagosPatentes.Select(pp => new PagosPatenteDTO
                    {
                        Fecha = pp.Fecha,
                        Descripcion = pp.Descripcion,
                        UsuarioId = pp.UsuarioId
                    }).ToList(),
                    PagoAnualidadDesde = p.PagoAnualidadDesde,
                    PagoAnualidadHasta = p.PagoAnualidadHasta
                })
                .FirstOrDefaultAsync();

            if (patente == null)
            {
                return NotFound();
            }

            return patente;
        }

        public class PatenteInputDTO
        {
            public int? PatenteId { get; set; }
            public int TipoPatenteId { get; set; }
            public int ClienteId { get; set; }
            public List<int>? contactosIds { get; set; }
            public int OficinaTramitanteId { get; set; }
            public int AbogadoId { get; set; }
            public string? AbogadoInternacional { get; set; }
            public string? CodigoPais { get; set; }
            public string? TituloEspanol { get; set; }
            public string? TituloIngles { get; set; }
            public string? Resumen { get; set; }
            public List<int>? InventoresIds { get; set; } = new List<int>();
            public List<int>? SolicitantesIds { get; set; } = new List<int>();
            public string? ReferenciaInterna { get; set; }
            public List<ReferenciaDTO> Referencias { get; set; } = new List<ReferenciaDTO>();
            public List<string>? Estados { get; set; }
            public string? Caja { get; set; }
            public string Registro { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public string Publicacion { get; set; }
            public DateTime? FechaPublicacion { get; set; }
            public string Certificado { get; set; }
            public DateTime? Vencimiento { get; set; }
            public string PctSolicitud { get; set; }
            public DateTime? FechaPctSolicitud { get; set; }
            public string PctPublicacion { get; set; }
            public DateTime? FechaPctPublicacion { get; set; }
            public List<PagosPatenteDTO> PagoPatentes { get; set; } = new List<PagosPatenteDTO>();
            public List<PrioridadPatenteDTO> PrioridadPatente { get; set; } = new List<PrioridadPatenteDTO>();
            public List<PublicacionPatenteDTO> Publicaciones { get; set; } = new List<PublicacionPatenteDTO>();
            public bool? PagoAnualidad { get; set; }
            public DateTime? PagoAnualidadDesde { get; set; }
            public DateTime? PagoAnualidadHasta { get; set; }
        }



        [HttpPost]
        public async Task<ActionResult<Patente>> PostPatente(PatenteInputDTO patenteDto)
        {
            if (_context.Patentes == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Patentes' is null.");
            }

            var patente = new Patente
            {
                TipoPatenteId = patenteDto.TipoPatenteId,
                ClienteId = patenteDto.ClienteId,
                OficinaTramitante = patenteDto.OficinaTramitanteId,
                Abogado = patenteDto.AbogadoId,
                AbogadoInternacional = patenteDto.AbogadoInternacional,
                CodigoPais = patenteDto.CodigoPais,
                TituloEspanol = patenteDto.TituloEspanol,
                TituloIngles = patenteDto.TituloIngles,
                Resumen = patenteDto.Resumen,
                ReferenciaInterna = patenteDto.ReferenciaInterna,
                Registro = patenteDto.Registro,
                FechaRegistro = patenteDto.FechaRegistro,
                Publicacion = patenteDto.Publicacion,
                FechaPublicacion = patenteDto.FechaPublicacion,
                Certificado = patenteDto.Certificado,
                Vencimiento = patenteDto.Vencimiento,
                PctSolicitud = patenteDto.PctSolicitud,
                FechaPctSolicitud = patenteDto.FechaPctSolicitud,
                PctPublicacion = patenteDto.PctPublicacion,
                FechaPctPublicacion = patenteDto.FechaPctPublicacion,
                PagoAnualidad = patenteDto.PagoAnualidad,
                PagoAnualidadDesde = patenteDto.PagoAnualidadDesde,
                PagoAnualidadHasta = patenteDto.PagoAnualidadHasta,
                Caja = patenteDto.Caja
            };

            foreach (var contactoId in patenteDto.contactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    patente.Contactos.Add(contacto); // Asume una relación de muchos a muchos
                }
            }

            // Inventores
            foreach (var inventorId in patenteDto.InventoresIds)
            {
                var inventor = await _context.Inventors.FindAsync(inventorId);
                if (inventor != null)
                {
                    patente.Inventors.Add(inventor); // Asume una relación de muchos a muchos
                }
            }

            // Solicitantes
            foreach (var solicitanteId in patenteDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    patente.Propietarios.Add(solicitante); // Asume una relación de muchos a muchos
                }
            }

            // Referencias
            foreach (var referenciaDto in patenteDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                patente.Referencia.Add(referencia);
            }

            // Estados
            if (patenteDto.Estados != null)
            {
                foreach (var estadoId in patenteDto.Estados)
                {
                    var estado = await _context.Estados.FindAsync(estadoId);
                    if (estado != null)
                    {
                        patente.EstadoPatentes.Add(new EstadoPatente { EstadoId = estadoId });
                    }
                }
            }

            // Pagos de Patente
            foreach (var pagoDto in patenteDto.PagoPatentes)
            {
                var pago = new PagosPatente
                {
                    Fecha = pagoDto.Fecha,
                    Descripcion = pagoDto.Descripcion,
                    UsuarioId = pagoDto.UsuarioId
                };
                patente.PagosPatentes.Add(pago);
            }

            // Prioridades de Patente
            foreach (var prioridadDto in patenteDto.PrioridadPatente)
            {
                var prioridad = new PrioridadPatente
                {
                    CodigoPais = prioridadDto.CodigoPais,
                    Numero = prioridadDto.Numero,
                    Fecha = prioridadDto.Fecha,
                };
                patente.PrioridadPatentes.Add(prioridad);
            }

            // Prioridades de Patente
            foreach (var PublicacionPatenteDTO in patenteDto.Publicaciones)
            {
                var publicacion = new PublicacionPatente
                {
                    TipoPublicacionId = PublicacionPatenteDTO.TipoPublicacionId,
                    NumeroGaceta = PublicacionPatenteDTO.NumeroGaceta,
                    Pagina = PublicacionPatenteDTO.Pagina
                };
                patente.PublicacionPatentes.Add(publicacion);
            }

            _context.Patentes.Add(patente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPatente", new { id = patente.PatenteId }, patente);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatente(int id, PatenteInputDTO patenteDto)
        {
            var patente = await _context.Patentes
                .Include(p => p.Contactos)
                .Include(p => p.Inventors)
                .Include(p => p.Propietarios)
                .Include(p => p.EstadoPatentes)
                .Include(p => p.Referencia)
                .Include(p => p.PagosPatentes)
                .Include(p => p.PrioridadPatentes)
                .Include(p => p.PublicacionPatentes)
                .FirstOrDefaultAsync(p => p.PatenteId == id);

            if (patente == null)
            {
                return NotFound();
            }

            // Actualizar campos básicos de la patente
            patente.TipoPatenteId = patenteDto.TipoPatenteId;
            patente.ClienteId = patenteDto.ClienteId;
            patente.OficinaTramitante = patenteDto.OficinaTramitanteId;
            patente.Abogado = patenteDto.AbogadoId;
            patente.AbogadoInternacional = patenteDto.AbogadoInternacional;
            patente.CodigoPais = patenteDto.CodigoPais;
            patente.TituloEspanol = patenteDto.TituloEspanol;
            patente.TituloIngles = patenteDto.TituloIngles;
            patente.Resumen = patenteDto.Resumen;
            patente.ReferenciaInterna = patenteDto.ReferenciaInterna;
            patente.Registro = patenteDto.Registro;
            patente.FechaRegistro = patenteDto.FechaRegistro;
            patente.Publicacion = patenteDto.Publicacion;
            patente.FechaPublicacion = patenteDto.FechaPublicacion;
            patente.Certificado = patenteDto.Certificado;
            patente.Vencimiento = patenteDto.Vencimiento;
            patente.PctSolicitud = patenteDto.PctSolicitud;
            patente.FechaPctSolicitud = patenteDto.FechaPctSolicitud;
            patente.PctPublicacion = patenteDto.PctPublicacion;
            patente.FechaPctPublicacion = patenteDto.FechaPctPublicacion;
            patente.PagoAnualidad = patenteDto.PagoAnualidad;
            patente.PagoAnualidadDesde = patenteDto.PagoAnualidadDesde;
            patente.PagoAnualidadHasta = patenteDto.PagoAnualidadHasta;
            patente.Caja = patenteDto.Caja;

            // Actualizar relaciones como Contactos, Inventores, etc.
            patente.Contactos.Clear();
            foreach (var contactoId in patenteDto.contactosIds)
            {
                var contacto = await _context.ContactosClientes.FindAsync(contactoId);
                if (contacto != null)
                {
                    patente.Contactos.Add(contacto);
                }
            }

            patente.Inventors.Clear();
            foreach (var inventorId in patenteDto.InventoresIds)
            {
                var inventor = await _context.Inventors.FindAsync(inventorId);
                if (inventor != null)
                {
                    patente.Inventors.Add(inventor);
                }
            }

            foreach (var prioridadActual in patente.PrioridadPatentes.ToList())
            {
                _context.PrioridadPatentes.Remove(prioridadActual);
            }
            patente.PrioridadPatentes.Clear();
            foreach (var prioridadDto in patenteDto.PrioridadPatente)
            {
                var prioridad = new PrioridadPatente
                {
                    CodigoPais = prioridadDto.CodigoPais,
                    Numero = prioridadDto.Numero,
                    Fecha = prioridadDto.Fecha
                };
                patente.PrioridadPatentes.Add(prioridad);
            }

            patente.Propietarios.Clear();
            foreach (var solicitanteId in patenteDto.SolicitantesIds)
            {
                var solicitante = await _context.Propietarios.FindAsync(solicitanteId);
                if (solicitante != null)
                {
                    patente.Propietarios.Add(solicitante);
                }
            }

            patente.EstadoPatentes.Clear();
            foreach (var estadoCodigo in patenteDto.Estados)
            {
                var estado = await _context.Estados.FirstOrDefaultAsync(e => e.Codigo == estadoCodigo);
                if (estado != null)
                {
                    patente.EstadoPatentes.Add(new EstadoPatente { Estado = estado });
                }
            }

            foreach (var referenciaActual in patente.Referencia.ToList())
            {
                _context.Referencia.Remove(referenciaActual);
            }
            patente.Referencia.Clear();
            foreach (var referenciaDto in patenteDto.Referencias)
            {
                var referencia = new Referencium
                {
                    TipoReferenciaId = referenciaDto.TipoReferenciaId,
                    Referencia = referenciaDto.Referencia
                };
                patente.Referencia.Add(referencia);
            }

            foreach (var publicacionActual in patente.PublicacionPatentes.ToList())
            {
                _context.PublicacionPatentes.Remove(publicacionActual);
            }
            patente.PublicacionPatentes.Clear();
            foreach (var publicacionDto in patenteDto.Publicaciones)
            {
                var publicacion = new PublicacionPatente
                {
                    TipoPublicacionId = publicacionDto.TipoPublicacionId,
                    NumeroGaceta = publicacionDto.NumeroGaceta,
                    Pagina = publicacionDto.Pagina
                };
                patente.PublicacionPatentes.Add(publicacion);
            }


            foreach (var pagoActual in patente.PagosPatentes.ToList())
            {
                _context.PagosPatentes.Remove(pagoActual);
            }
            patente.PagosPatentes.Clear();
            foreach (var pagoDto in patenteDto.PagoPatentes)
            {
                var pago = new PagosPatente
                {
                    Fecha = pagoDto.Fecha,
                    Descripcion = pagoDto.Descripcion,
                    UsuarioId = pagoDto.UsuarioId
                };
                patente.PagosPatentes.Add(pago);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatenteExists(id))
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


        // DELETE: Patentes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatente(int id)
        {
            var patente = await _context.Patentes
                .Include(p => p.Inventors)
                .Include(p => p.Propietarios)
                .Include(p => p.EstadoPatentes)
                .Include(p => p.Contactos)
                .FirstOrDefaultAsync(p => p.PatenteId == id);

            if (patente == null)
            {
                return NotFound();
            }

            // Limpiar relaciones
            patente.Inventors.Clear();
            patente.Propietarios.Clear();
            patente.EstadoPatentes.Clear();
            patente.Contactos.Clear();

            // Eliminar entidades relacionadas
            foreach (var pago in patente.PagosPatentes.ToList())
            {
                _context.PagosPatentes.Remove(pago);
            }

            foreach (var prioridad in patente.PrioridadPatentes.ToList())
            {
                _context.PrioridadPatentes.Remove(prioridad);
            }

            foreach (var publicacion in patente.PublicacionPatentes.ToList())
            {
                _context.PublicacionPatentes.Remove(publicacion);
            }

            await DeleteCarpetaPatente(id);

            _context.Patentes.Remove(patente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task DeleteCarpetaPatente(int patenteId)
        {
            string nombreContenedor = "patente";
            string nombreCarpeta = $"patente{patenteId}/"; 

            var containerClient = _blobServiceClient.GetBlobContainerClient(nombreContenedor);
            if (await containerClient.ExistsAsync())
            {
                await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: nombreCarpeta))
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    await blobClient.DeleteIfExistsAsync();
                }
            }

            var documentos = await _context.ConexionDocumentos
                .Where(d => d.IdConexion == patenteId && d.TablaConexion == "patente")
                .ToListAsync();

            _context.ConexionDocumentos.RemoveRange(documentos);
        }


        private bool PatenteExists(int id)
        {
            return (_context.Patentes?.Any(e => e.PatenteId == id)).GetValueOrDefault();
        }
    }
}
