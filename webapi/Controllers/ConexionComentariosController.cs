using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Route("ConexionComentario")]
    [ApiController]
    public class ConexionComentariosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public ConexionComentariosController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class ConexionComentarioDTO
        {
            public int ConexionComentarioId { get; set; }
            public string TablaConexion { get; set; } = null!;
            public int IdConexion { get; set; }
            public DateTime Fecha { get; set; }
            public string Titulo { get; set; } = null!;
            public string Comentario { get; set; } = null!;
            public string? Usuario { get; set; }
        }

        // GET: api/ConexionComentarios/BuscarPorConexion
        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<ConexionComentarioDTO>>> GetConexionComentariosPorConexion(string tablaConexion, int idConexion)
        {
            if (_context.ConexionComentarios == null)
            {
                return NotFound();
            }

            var comentarios = await _context.ConexionComentarios
                .Where(c => c.TablaConexion == tablaConexion && c.IdConexion == idConexion)
                .ToListAsync();

            if (comentarios == null || !comentarios.Any())
            {
                return NotFound();
            }

            var comentariosDTO = comentarios.Select(c => new ConexionComentarioDTO
            {
                ConexionComentarioId = c.ConexionComentarioId,
                TablaConexion = c.TablaConexion,
                IdConexion = c.IdConexion,
                Fecha = c.Fecha,
                Titulo = c.Titulo,
                Comentario = c.Comentario,
                Usuario = c.Usuario
            });

            return Ok(comentariosDTO);
        }


        // GET: api/ConexionComentarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConexionComentarioDTO>>> GetConexionComentarios()
        {
            if (_context.ConexionComentarios == null)
            {
                return NotFound();
            }
            var comentarios = await _context.ConexionComentarios.ToListAsync();
            var comentariosDTO = comentarios.Select(c => new ConexionComentarioDTO
            {
                ConexionComentarioId = c.ConexionComentarioId,
                TablaConexion = c.TablaConexion,
                IdConexion = c.IdConexion,
                Fecha = c.Fecha,
                Titulo = c.Titulo,
                Comentario = c.Comentario,
                Usuario = c.Usuario
            });
            return Ok(comentariosDTO);
        }

        // GET: api/ConexionComentarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConexionComentarioDTO>> GetConexionComentario(int id)
        {
            if (_context.ConexionComentarios == null)
            {
                return NotFound();
            }
            var conexionComentario = await _context.ConexionComentarios.FindAsync(id);

            if (conexionComentario == null)
            {
                return NotFound();
            }

            var comentarioDTO = new ConexionComentarioDTO
            {
                ConexionComentarioId = conexionComentario.ConexionComentarioId,
                TablaConexion = conexionComentario.TablaConexion,
                IdConexion = conexionComentario.IdConexion,
                Fecha = conexionComentario.Fecha,
                Titulo = conexionComentario.Titulo,
                Comentario = conexionComentario.Comentario,
                Usuario = conexionComentario.Usuario
            };

            return comentarioDTO;
        }

        // POST: api/ConexionComentarios
        [HttpPost]
        public async Task<ActionResult<ConexionComentarioDTO>> PostConexionComentario(ConexionComentarioDTO conexionComentarioDTO)
        {
            if (_context.ConexionComentarios == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.ConexionComentarios' is null.");
            }
            var conexionComentario = new ConexionComentario
            {
                TablaConexion = conexionComentarioDTO.TablaConexion,
                IdConexion = conexionComentarioDTO.IdConexion,
                Fecha = conexionComentarioDTO.Fecha,
                Titulo = conexionComentarioDTO.Titulo,
                Comentario = conexionComentarioDTO.Comentario,
                Usuario = conexionComentarioDTO.Usuario
            };

            _context.ConexionComentarios.Add(conexionComentario);
            await _context.SaveChangesAsync();

            conexionComentarioDTO.ConexionComentarioId = conexionComentario.ConexionComentarioId;

            return CreatedAtAction("GetConexionComentario", new { id = conexionComentario.ConexionComentarioId }, conexionComentarioDTO);
        }

        // PUT: api/ConexionComentarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutConexionComentario(int id, ConexionComentarioDTO conexionComentarioDTO)
        {
            if (id != conexionComentarioDTO.ConexionComentarioId)
            {
                return BadRequest();
            }

            var conexionComentario = await _context.ConexionComentarios.FindAsync(id);
            if (conexionComentario == null)
            {
                return NotFound();
            }

            conexionComentario.TablaConexion = conexionComentarioDTO.TablaConexion;
            conexionComentario.IdConexion = conexionComentarioDTO.IdConexion;
            conexionComentario.Fecha = conexionComentarioDTO.Fecha;
            conexionComentario.Titulo = conexionComentarioDTO.Titulo;
            conexionComentario.Comentario = conexionComentarioDTO.Comentario;
            conexionComentario.Usuario = conexionComentarioDTO.Usuario;

            _context.Entry(conexionComentario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConexionComentarioExists(id))
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

        // DELETE: api/ConexionComentarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConexionComentario(int id)
        {
            if (_context.ConexionComentarios == null)
            {
                return NotFound();
            }
            var conexionComentario = await _context.ConexionComentarios.FindAsync(id);
            if (conexionComentario == null)
            {
                return NotFound();
            }

            _context.ConexionComentarios.Remove(conexionComentario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ConexionComentarioExists(int id)
        {
            return (_context.ConexionComentarios?.Any(e => e.ConexionComentarioId == id)).GetValueOrDefault();
        }

    }
}
