using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.ClientesController;
using Microsoft.AspNetCore.Authorization;
using Azure.Storage.Blobs;

namespace webapi.Controllers
{
    [Route("Propietarios")]
    [ApiController]
    public class PropietariosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;

        public PropietariosController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public class AbogadoDto
        {
            public int AbogadoId { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }

        }

        public class PropietarioDto
        {
            public int PropietarioId { get; set; } //dd
            public string Nombre { get; set; } //dd
            public string? NumeroPoder { get; set; }
            public DateTime? FechaPoder { get; set; }
            public string? Origen { get; set; }
            public string? Notas { get; set; }
            public bool? General { get; set; }
            public List<AbogadoDto> Abogados { get; set; }
            public PaisDTO Pais { get; set; }
        }

        // GET: api/Propietarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPropietarios()
        {
            if (_context.Propietarios == null)
            {
                return NotFound();
            }
            return await _context.Propietarios
                .Include(p => p.CodigoPaisNavigation)
                .Select(p => new PropietarioDto
                {
                    PropietarioId = p.PropietarioId,
                    Nombre = p.Nombre,
                    NumeroPoder = p.NumeroPoder,
                    FechaPoder = p.FechaPoder,
                    Origen = p.Origen,
                    Notas = p.Notas,
                    General = p.General,
                    Pais = new PaisDTO
                    {
                        Nombre = p.CodigoPaisNavigation.Nombre,
                        CodigoPais = p.CodigoPaisNavigation.CodigoPais
                    }
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropietarioDto>> GetPropietario(int id)
        {
            if (_context.Propietarios == null)
            {
                return NotFound();
            }

            var propietarioDto = await _context.Propietarios
                .Where(p => p.PropietarioId == id)
                .Select(p => new PropietarioDto
                {
                    PropietarioId = p.PropietarioId,
                    Nombre = p.Nombre,
                    NumeroPoder = p.NumeroPoder,
                    FechaPoder = p.FechaPoder,
                    Origen = p.Origen,
                    Notas = p.Notas,
                    General= p.General,
                    Pais = new PaisDTO
                    {
                        Nombre = p.CodigoPaisNavigation.Nombre,
                        CodigoPais = p.CodigoPaisNavigation.CodigoPais
                    },
                    Abogados = p.Abogados.Select(a => new AbogadoDto
                    {
                        AbogadoId = a.AbogadoId,
                        Nombre = a.Nombre,
                        Apellido = a.Apellido
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (propietarioDto == null)
            {
                return NotFound();
            }

            return propietarioDto;
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<PropietarioDto>>> SearchPropietarios(
            string? dropdownSearch,
            int? propietarioId,
            string? nombre,
            string? codigoPais,
            string? numeroPoder,
            DateTime? fechaPoderInicio,
            DateTime? fechaPoderFin,
            string? origen,
            bool? general,
            int? abogadoId,
            bool cantidad)
        {
            if (_context.Propietarios == null)
            {
                return NotFound();
            }

            var query = _context.Propietarios.AsQueryable();

            cantidad = false;
            if (!string.IsNullOrEmpty(dropdownSearch))
            {
                query = query.Where(p => p.Nombre.Contains(dropdownSearch) || p.PropietarioId.ToString().Contains(dropdownSearch));
                cantidad = true;
            }
            if (propietarioId.HasValue)
            {
                query = query.Where(p => p.PropietarioId.ToString().Contains(propietarioId.Value.ToString()));
            }
            if (!string.IsNullOrEmpty(nombre))
            {
                query = query.Where(p => p.Nombre.Contains(nombre));
            }
            if (!string.IsNullOrEmpty(codigoPais))
            {
                query = query.Where(p => p.CodigoPais == codigoPais);
            }
            if (!string.IsNullOrEmpty(numeroPoder))
            {
                query = query.Where(p => p.NumeroPoder == numeroPoder);
            }
            if (fechaPoderInicio.HasValue && fechaPoderFin.HasValue)
            {
                query = query.Where(p => p.FechaPoder >= fechaPoderInicio.Value && p.FechaPoder <= fechaPoderFin.Value);
            }
            else if (fechaPoderInicio.HasValue)
            {
                query = query.Where(p => p.FechaPoder >= fechaPoderInicio.Value);
            }
            else if (fechaPoderFin.HasValue)
            {
                query = query.Where(p => p.FechaPoder <= fechaPoderFin.Value);
            }
            if (!string.IsNullOrEmpty(origen))
            {
                query = query.Where(p => p.Origen == origen);
            }
            if (general.HasValue)
            {
                query = query.Where(p => p.General == general.Value);
            }   
            if (abogadoId.HasValue)
            {
                query = query.Where(p => p.Abogados.Any(a => a.AbogadoId == abogadoId.Value));
            }

            var result = new List<PropietarioDto>();

            if (cantidad)
            {
                result = await query
                .Include(p => p.CodigoPaisNavigation)
                .Include(p => p.Abogados)
                .Select(p => new PropietarioDto
                {
                    PropietarioId = p.PropietarioId,
                    Nombre = p.Nombre,
                    NumeroPoder = p.NumeroPoder,
                    FechaPoder = p.FechaPoder,
                    Origen = p.Origen,
                    Notas = p.Notas,
                    General = p.General,
                    Pais = new PaisDTO
                    {
                        Nombre = p.CodigoPaisNavigation.Nombre,
                        CodigoPais = p.CodigoPaisNavigation.CodigoPais
                    },
                    Abogados = p.Abogados.Select(a => new AbogadoDto
                    {
                        AbogadoId = a.AbogadoId,
                        Nombre = a.Nombre,
                        Apellido = a.Apellido
                    }).ToList()
                })
                .Take(50)
                .ToListAsync();

            }
            else
            {
                result = await query
                .Include(p => p.CodigoPaisNavigation)
                .Include(p => p.Abogados)
                .Select(p => new PropietarioDto
                {
                    PropietarioId = p.PropietarioId,
                    Nombre = p.Nombre,
                    NumeroPoder = p.NumeroPoder,
                    FechaPoder = p.FechaPoder,
                    Origen = p.Origen,
                    Notas = p.Notas,
                    General = p.General,
                    Pais = new PaisDTO
                    {
                        Nombre = p.CodigoPaisNavigation.Nombre,
                        CodigoPais = p.CodigoPaisNavigation.CodigoPais
                    },
                    Abogados = p.Abogados.Select(a => new AbogadoDto
                    {
                        AbogadoId = a.AbogadoId,
                        Nombre = a.Nombre,
                        Apellido = a.Apellido
                    }).ToList()
                })
                .ToListAsync();
            }

            return result;

        }


        // GET: api/Propietarios/BuscarPorMarca/5
        [HttpGet("Marca/{marcaId}")]
        public async Task<ActionResult<IEnumerable<PropietarioDropDownDto>>> GetPropietariosPorMarca(int marcaId)
        {
            if (_context.Propietarios == null)
            {
                return NotFound();
            }

            var propietarios = await _context.Propietarios
                .Where(p => p.Marcas.Any(m => m.MarcaId == marcaId))
                .Select(p => new PropietarioDropDownDto
                {
                    PropietarioId = p.PropietarioId,
                    Nombre = p.Nombre
                })
                .ToListAsync();

            if (!propietarios.Any())
            {
                return NotFound();
            }

            return propietarios;
        }



        public class PropietarioInput
        {
            public int PropietarioId { get; set; }
            public string Nombre { get; set; }
            public string? CodigoPais { get; set; }
            public string? NumeroPoder { get; set; }
            public DateTime? FechaPoder { get; set; }
            public string? Origen { get; set; }
            public string? Notas { get; set; }
            public bool? General { get; set; }
            public List<int> AbogadosIds { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<PropietarioInput>> PostPropietario(PropietarioInput PropietarioInput)
        {
            if (_context.Propietarios == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Propietarios' is null.");
            }

            var propietario = new Propietario
            {
                Nombre = PropietarioInput.Nombre,
                CodigoPais = PropietarioInput.CodigoPais,
                NumeroPoder = PropietarioInput.NumeroPoder,
                FechaPoder = PropietarioInput.FechaPoder,
                Origen = PropietarioInput.Origen,
                Notas = PropietarioInput.Notas,
                General = PropietarioInput.General
            };

            _context.Propietarios.Add(propietario);
            await _context.SaveChangesAsync();

            if (PropietarioInput.AbogadosIds != null && PropietarioInput.AbogadosIds.Count > 0)
            {
                var abogados = _context.Abogados.Where(a => PropietarioInput.AbogadosIds.Contains(a.AbogadoId)).ToList();
                foreach (var abogado in abogados)
                {
                    propietario.Abogados.Add(abogado);
                }

                _context.Update(propietario);
                await _context.SaveChangesAsync();
            }

            PropietarioInput.PropietarioId = propietario.PropietarioId;
            return CreatedAtAction("GetPropietario", new { id = propietario.PropietarioId }, PropietarioInput);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPropietario(int id, PropietarioInput propietarioInput)
        {
            if (id != propietarioInput.PropietarioId)
            {
                return BadRequest();
            }

            var propietario = await _context.Propietarios
                .Include(p => p.Abogados)
                .FirstOrDefaultAsync(p => p.PropietarioId == id);

            if (propietario == null)
            {
                return NotFound();
            }

            // Actualizar los campos del propietario
            propietario.Nombre = propietarioInput.Nombre;
            propietario.CodigoPais = propietarioInput.CodigoPais;
            propietario.NumeroPoder = propietarioInput.NumeroPoder;
            propietario.FechaPoder = propietarioInput.FechaPoder;
            propietario.Origen = propietarioInput.Origen;
            propietario.Notas = propietarioInput.Notas;
            propietario.General = propietarioInput.General;

            if (propietarioInput.AbogadosIds != null)
            {
                var abogadosActualesIds = propietario.Abogados.Select(a => a.AbogadoId).ToList();
                var abogadosParaEliminar = propietario.Abogados
                    .Where(a => !propietarioInput.AbogadosIds.Contains(a.AbogadoId))
                    .ToList();
                foreach (var abogado in abogadosParaEliminar)
                {
                    propietario.Abogados.Remove(abogado);
                }
                var abogadosIdsParaAgregar = propietarioInput.AbogadosIds
                    .Except(abogadosActualesIds)
                    .ToList();
                var abogadosNuevos = await _context.Abogados
                    .Where(a => abogadosIdsParaAgregar.Contains(a.AbogadoId))
                    .ToListAsync();
                foreach (var abogado in abogadosNuevos)
                {
                    propietario.Abogados.Add(abogado);
                }
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Propietarios.Any(e => e.PropietarioId == id))
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



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePropietario(int id)
        {
            if (_context.Propietarios == null)
            {
                return NotFound();
            }
            var propietario = await _context.Propietarios.FindAsync(id);
            if (propietario == null)
            {
                return NotFound();
            }

            await DeleteCarpetaPropietario(id);

            _context.Propietarios.Remove(propietario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task DeleteCarpetaPropietario(int propietarioId)
        {
            string nombreContenedor = "propietario"; // Asegúrate de que el nombre del contenedor sea correcto
            string nombreCarpeta = $"propietario{propietarioId}/"; // Asegúrate de que el nombre de la carpeta sea correcto

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
                .Where(d => d.IdConexion == propietarioId && d.TablaConexion == "propietario")
                .ToListAsync();

            _context.ConexionDocumentos.RemoveRange(documentos);
        }

        private bool PropietarioExists(int id)
        {
            return (_context.Propietarios?.Any(e => e.PropietarioId == id)).GetValueOrDefault();
        }
    }
}
