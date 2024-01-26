using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Packaging;
using webapi.Models;
using static webapi.Controllers.Evento3Controller;

namespace webapi.Controllers
{
    [Route("EventoCuatro")]
    [ApiController]
    public class Evento4Controller : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public Evento4Controller(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class GrupoUnoEvento4sDto
        {
            public int GrupoUnoEvento4Id { get; set; }
            public PropietarioDropDownDto? Propietario { get; set; }
        }

        public class GrupoDosEvento4sDto
        {
            public int GrupoDosEvento4Id { get; set; }
            public PropietarioDropDownDto? Propietario { get; set; }
        }

        public class Evento4Dto
        {
            public int EventoId { get; set; }
            public EstadosDTO EstadoCodigo { get; set; }
            public TipoEventoDto TipoEvento { get; set; }
            public string? Solicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public List<GrupoUnoEvento4sDto>? GrupoUno { get; set; }
            public List<GrupoDosEvento4sDto>? GrupoDos { get; set; }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Evento4Dto>> GetEvento4(int id)
        {
            if (_context.Evento4s == null)
            {
                return NotFound();
            }
            var evento4 = await _context.Evento4s
                .Include(e => e.EstadoCodigoNavigation)
                .Include(e => e.GrupoUnoEvento4s)
                .Include(e => e.TipoEvento)
                .Where(e => e.EventoId == id)
                .Select(e => new Evento4Dto
                {
                    EventoId = e.EventoId,
                    EstadoCodigo = new EstadosDTO
                    {
                        Codigo = e.EstadoCodigoNavigation.Codigo,
                        DescripcionEspanol = e.EstadoCodigoNavigation.DescripcionEspanol,
                        DescripcionIngles = e.EstadoCodigoNavigation.DescripcionIngles,
                        Color = e.EstadoCodigoNavigation.Color
                    },
                    TipoEvento = new TipoEventoDto
                    {
                        TipoEventoId = e.TipoEvento.TipoEventoId,
                        Nombre = e.TipoEvento.Nombre,
                        TablaEvento = e.TipoEvento.TablaEvento
                    },
                    Solicitud = e.Solicitud,
                    Registro = e.Registro,
                    FechaSolicitud = e.FechaSolicitud,
                    FechaRegistro = e.FechaRegistro,
                    GrupoUno = e.GrupoUnoEvento4s.Select(g => new GrupoUnoEvento4sDto
                    {
                        GrupoUnoEvento4Id = g.GrupoUnoEvento4Id,
                        Propietario = new PropietarioDropDownDto
                        {
                            PropietarioId = g.Propietario.PropietarioId,
                            Nombre = g.Propietario.Nombre
                        }
                    }).ToList(),
                    GrupoDos = e.GrupoDosEvento4s.Select(g => new GrupoDosEvento4sDto
                    {
                        GrupoDosEvento4Id = g.GrupoDosEvento4Id,
                        Propietario = new PropietarioDropDownDto
                        {
                            PropietarioId = g.Propietario.PropietarioId,
                            Nombre = g.Propietario.Nombre
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (evento4 == null)
            {
                return NotFound();
            }

            return evento4;
        }

        public class CreateEvento4Dto
        {
            public string EstadoCodigo { get; set; }
            public int TipoEventoId { get; set; }
            public string? Solicitud { get; set; }
            public string? Registro { get; set; }
            public DateTime? FechaSolicitud { get; set; }
            public DateTime? FechaRegistro { get; set; }
            public List<int> GrupoUnoPropietariosIds { get; set; }
            public List<int> GrupoDosPropietariosIds { get; set; }
            public string TablaConexion { get; set; }
            public int IdConexion { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<Evento4Dto>> PostEvento4([FromBody] CreateEvento4Dto createDto)
        {
            var nuevoEvento4 = new Evento4
            {
                EstadoCodigo = createDto.EstadoCodigo,
                TipoEventoId = createDto.TipoEventoId,
                Solicitud = createDto.Solicitud,
                Registro = createDto.Registro,
                FechaSolicitud = createDto.FechaSolicitud,
                FechaRegistro = createDto.FechaRegistro,
                GrupoUnoEvento4s = createDto.GrupoUnoPropietariosIds
                    .Select(id => new GrupoUnoEvento4 { PropietarioId = id }).ToList(),
                GrupoDosEvento4s = createDto.GrupoDosPropietariosIds
                    .Select(id => new GrupoDosEvento4 { PropietarioId = id }).ToList()
            };

            var tiposEventoParaCambiarPropietarios = new List<int> { 6, 8, 9, 10 };
            var debeCambiarPropietarios = tiposEventoParaCambiarPropietarios.Contains(createDto.TipoEventoId);
            var debeAgregarPropietarios = createDto.TipoEventoId == 7;

            if (debeCambiarPropietarios || debeAgregarPropietarios)
            {
                if (createDto.TablaConexion.ToLower() == "marca")
                {
                    await ProcesarCambiosPropietariosMarca(createDto, debeCambiarPropietarios);
                }
                else if (createDto.TablaConexion.ToLower() == "patente")
                {
                    await ProcesarCambiosPropietariosPatente(createDto, debeCambiarPropietarios);
                }
            }


            _context.Evento4s.Add(nuevoEvento4);
            await _context.SaveChangesAsync();

            // Crear y guardar ConexionEvento
            var conexionEvento = new ConexionEvento
            {
                TablaConexion = createDto.TablaConexion,
                IdConexion = createDto.IdConexion,
                TablaConexionEvento = "evento4",
                IdEvento = nuevoEvento4.EventoId
            };


            switch (createDto.TablaConexion.ToLower())
            {
                case "marca":
                    await ActualizarEstadoMarca(createDto.IdConexion, createDto.EstadoCodigo);
                    break;
                case "patente":
                    await ActualizarEstadoPatente(createDto.IdConexion, createDto.EstadoCodigo);
                    break;
                case "acciontercero":
                    await ActualizarEstadoAccion(createDto.IdConexion, createDto.EstadoCodigo);
                    break;
                default:
                    return BadRequest("El nombre de la tabla no existe");
            }

            _context.ConexionEventos.Add(conexionEvento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvento4), new { id = nuevoEvento4.EventoId }, nuevoEvento4);
        }


        private async Task ProcesarCambiosPropietariosMarca(CreateEvento4Dto createDto, bool cambiarPropietarios)
        {
            var marca = await _context.Marcas.Include(m => m.Propietarios).FirstOrDefaultAsync(m => m.MarcaId == createDto.IdConexion);
            if (marca == null) throw new KeyNotFoundException("Marca no encontrada.");

            if (cambiarPropietarios)
            {
                // Guardar los propietarios originales y luego eliminar todos
                var propietariosOriginales = marca.Propietarios.ToList();
                marca.Propietarios.Clear();

                // Determinar cuáles propietarios deben ser eliminados definitivamente y cuáles deben mantenerse
                var propietariosParaEliminarDefinitivamente = propietariosOriginales.Where(p => createDto.GrupoUnoPropietariosIds.Contains(p.PropietarioId)).ToList();
                var propietariosParaMantener = propietariosOriginales.Except(propietariosParaEliminarDefinitivamente).ToList();

                // Agregar de nuevo los propietarios que deben mantenerse
                foreach (var propietario in propietariosParaMantener)
                {
                    marca.Propietarios.Add(propietario);
                }

                // Agregar nuevos propietarios desde GrupoDosPropietariosIds
                var nuevosPropietarios = _context.Propietarios.Where(p => createDto.GrupoDosPropietariosIds.Contains(p.PropietarioId));
                foreach (var propietario in nuevosPropietarios)
                {
                    if (!marca.Propietarios.Any(p => p.PropietarioId == propietario.PropietarioId))
                    {
                        marca.Propietarios.Add(propietario);
                    }
                }
            }
            else
            {
                var nuevosPropietarios = _context.Propietarios.Where(p => createDto.GrupoDosPropietariosIds.Contains(p.PropietarioId));
                foreach (var propietario in nuevosPropietarios)
                {
                    if (!marca.Propietarios.Any(p => p.PropietarioId == propietario.PropietarioId))
                    {
                        marca.Propietarios.Add(propietario);
                    }
                }
            }

            _context.Update(marca);
            await _context.SaveChangesAsync();
        }


        private async Task ProcesarCambiosPropietariosPatente(CreateEvento4Dto createDto, bool cambiarPropietarios)
        {
            var patente = await _context.Patentes.Include(p => p.Propietarios).FirstOrDefaultAsync(p => p.PatenteId == createDto.IdConexion);
            if (patente == null) throw new KeyNotFoundException("Patente no encontrada.");

            if (cambiarPropietarios)
            {
                // Guardar los propietarios originales y luego eliminar todos
                var propietariosOriginales = patente.Propietarios.ToList();
                patente.Propietarios.Clear();

                // Determinar cuáles propietarios deben ser eliminados definitivamente y cuáles deben mantenerse
                var propietariosParaEliminarDefinitivamente = propietariosOriginales.Where(p => createDto.GrupoUnoPropietariosIds.Contains(p.PropietarioId)).ToList();
                var propietariosParaMantener = propietariosOriginales.Except(propietariosParaEliminarDefinitivamente).ToList();

                // Agregar de nuevo los propietarios que deben mantenerse
                foreach (var propietario in propietariosParaMantener)
                {
                    patente.Propietarios.Add(propietario);
                }

                // Agregar nuevos propietarios desde GrupoDosPropietariosIds
                var nuevosPropietarios = _context.Propietarios.Where(p => createDto.GrupoDosPropietariosIds.Contains(p.PropietarioId));
                foreach (var propietario in nuevosPropietarios)
                {
                    if (!patente.Propietarios.Any(p => p.PropietarioId == propietario.PropietarioId))
                    {
                        patente.Propietarios.Add(propietario);
                    }
                }
            }
            else
            {
                var nuevosPropietarios = _context.Propietarios.Where(p => createDto.GrupoDosPropietariosIds.Contains(p.PropietarioId));
                foreach (var propietario in nuevosPropietarios)
                {
                    if (!patente.Propietarios.Any(p => p.PropietarioId == propietario.PropietarioId))
                    {
                        patente.Propietarios.Add(propietario);
                    }
                }
            }

            _context.Update(patente);
            await _context.SaveChangesAsync();
        }

        private async Task<IActionResult> ActualizarEstadoMarca(int marcaId, string estadoId)
        {
            var marca = await _context.Marcas.Include(m => m.EstadoMarcas).FirstOrDefaultAsync(m => m.MarcaId == marcaId);
            if (marca == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (marca.EstadoMarcas.Any(em => em.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoMarca = new EstadoMarca
            {
                MarcaId = marcaId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            marca.EstadoMarcas.Add(nuevoEstadoMarca);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private async Task<IActionResult> ActualizarEstadoPatente(int patenteId, string estadoId)
        {
            var patente = await _context.Patentes.Include(p => p.EstadoPatentes).FirstOrDefaultAsync(p => p.PatenteId == patenteId);
            if (patente == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (patente.EstadoPatentes.Any(ep => ep.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoPatente = new EstadoPatente
            {
                PatenteId = patenteId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            patente.EstadoPatentes.Add(nuevoEstadoPatente);
            await _context.SaveChangesAsync();

            return Ok();
        }


        private async Task<IActionResult> ActualizarEstadoAccion(int accionTerceroId, string estadoId)
        {
            var accion = await _context.AccionTerceros.Include(a => a.EstadoAcciones).FirstOrDefaultAsync(a => a.AccionTerceroId == accionTerceroId);
            if (accion == null)
            {
                return NotFound();
            }

            // Verificar si ya existe una relación con el estado especificado
            if (accion.EstadoAcciones.Any(ea => ea.EstadoId == estadoId))
            {
                return StatusCode(StatusCodes.Status208AlreadyReported);
            }

            var nuevoEstadoAccion = new EstadoAccion
            {
                AccionTerceroId = accionTerceroId,
                EstadoId = estadoId,
                Estado = await _context.Estados.FindAsync(estadoId)
            };

            accion.EstadoAcciones.Add(nuevoEstadoAccion);
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
